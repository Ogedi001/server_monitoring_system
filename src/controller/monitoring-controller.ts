import promClient, { Counter, Summary, Gauge, Histogram } from "prom-client";

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import os from "os";
import Logger from "../logger";
import {
    checkSystemHealth,
    cpuLoadInfo,
    disksMetricsInfo,
    memoryUsageInfo,
    networkMetricsInfo,
} from "../utils/monitoring-utils";

//http metrics
export const httpRequestCounter = new Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests processed",
    labelNames: ["method", "route", "status_code"],
});

export const error_httpRequestCounter = new promClient.Counter({
    name: "http_request_errors_total",
    help: "Total number of HTTP request errors",
    labelNames: ["method", "route", "status_code"],
});

export const success_httpRequestCounter = new promClient.Counter({
    name: "http_request_success_total",
    help: "Total number of successful HTTP requests",
    labelNames: ["method", "route", "status_code"],
});

export const responseTimeSummary = new Summary({
    name: "http_response_time_seconds",
    help: "Response time in seconds",
    labelNames: ["method", "route", "status_code"],
    percentiles: [0.01, 0.1, 0.9, 0.95, 0.99],
});

//System Availability metrics

const uptimeCounter = new promClient.Counter({
    name: "system_uptime_checks_total",
    help: "Total number of uptime checks",
});

const downtimeCounter = new promClient.Counter({
    name: "system_downtime_checks_total",
    help: "Total number of downtime checks",
});

const availabilityGauge = new promClient.Gauge({
    name: "system_availability_percentage",
    help: "System availability percentage",
});

//resources Availability
//disk usage checks
const totalDiskSpaceGauge = new promClient.Gauge({
    name: "disk_space_total_bytes",
    help: "Total disk space in bytes",
});

const availableDiskSpaceGauge = new promClient.Gauge({
    name: "disk_space_available_percentage",
    help: "Available disk space in percentage",
});

const diskUsagePercentageGauge = new promClient.Gauge({
    name: "disk_usage_percentage",
    help: "Disk usage percentage",
});

//cpu usage

const totalCurrentLoadMetric = new promClient.Gauge({
    name: "cpu_total_current_load_percentage",
    help: "Total current CPU load percentage",
});

const userCurrentLoadMetric = new promClient.Gauge({
    name: "cpu_user_current_load_percentage",
    help: "Total current CPU load from user processes percentage",
});

const systemCurrentLoadMetric = new promClient.Gauge({
    name: "cpu_system_current_load_percentage",
    help: "Total current CPU load from system processes percentage",
});

//memory usage
const totalMemoryMetric = new promClient.Gauge({
    name: "memory_total_bytes",
    help: "Total memory in bytes",
});

const usedMemoryPercentageMetric = new promClient.Gauge({
    name: "memory_used_percentage",
    help: "Used memory as a percentage of total memory",
});

const availableMemoryPercentageMetric = new promClient.Gauge({
    name: "memory_available_percentage",
    help: "Available memory as a percentage of total memory",
});

// network metrics
const networkInterfacesMetric = new promClient.Gauge({
    name: "network_interfaces",
    help: "Number of network interfaces",
});

const totalNetworkReceivedMetric = new promClient.Gauge({
    name: "network_received_bytes_total",
    help: "Total data received over all network interfaces in bytes",
});

const totalNetworkSentMetric = new promClient.Gauge({
    name: "network_sent_bytes_total",
    help: "Total data sent over all network interfaces in bytes",
});

const loadGauge = new Gauge({
    name: "server_load_average",
    help: "Server load average over the last 1, 5, and 15 minutes",
    labelNames: ["interval"],
});

function updateLoadMetric() {
    const loadAverages = os.loadavg();
    loadGauge.set({ interval: "1m" }, loadAverages[0]);
    loadGauge.set({ interval: "5m" }, loadAverages[1]);
    loadGauge.set({ interval: "15m" }, loadAverages[2]);
    Logger.info(
        `System load averages updated: 1m=${loadAverages[0]}, 5m=${loadAverages[1]}, 15m=${loadAverages[2]}`
    );
}

setInterval(updateLoadMetric, 300000);

setInterval(async () => {
    //Availability metrics
    if (await checkSystemHealth()) {
        uptimeCounter.inc();
    } else {
        downtimeCounter.inc();
    }

    const downtimeCountValue = (await downtimeCounter.get()).values[0].value;
    const uptimeCountValue = (await uptimeCounter.get()).values[0].value;
    // Calculate availability
    const totalCountValue = downtimeCountValue + uptimeCountValue;
    const availability = (uptimeCountValue / totalCountValue) * 100;
    availabilityGauge.set(availability);
    Logger.info(`System availability updated: ${availability} %`, {
        label: "metrics",
    });

    //network metrics
    const networkMetrics = await networkMetricsInfo();
    networkInterfacesMetric.set(networkMetrics.networkInterfaces);
    totalNetworkReceivedMetric.set(networkMetrics.totalReceived);
    totalNetworkSentMetric.set(networkMetrics.totalSent);

    //disk usage guage metrics
    const diskInfo = await disksMetricsInfo();
    totalDiskSpaceGauge.set(diskInfo?.total!);
    availableDiskSpaceGauge.set(diskInfo?.availablePercentage!);
    diskUsagePercentageGauge.set(diskInfo?.usagePercentage!);

    //memory usage
    const memoryUsage = await memoryUsageInfo();
    totalMemoryMetric.set(memoryUsage.totalMemory);
    usedMemoryPercentageMetric.set(memoryUsage.memoryUsagePercentage);
    availableMemoryPercentageMetric.set(memoryUsage.availableMemoryPercentage);

    //cpu usage
    const cpuInfo = await cpuLoadInfo();
    totalCurrentLoadMetric.set(cpuInfo.currentLoad);
    userCurrentLoadMetric.set(cpuInfo.currentLoadUser);
    systemCurrentLoadMetric.set(cpuInfo.currentLoadSystem);
}, 30000);

// Enable default metrics collection
//promClient.collectDefaultMetrics();

export async function handleMetricsRequest(_: Request, res: Response) {
    try {
        res.set("Content-Type", promClient.register.contentType);
        res.end(await promClient.register.metrics());
    } catch (err) {
        Logger.error(`An error occurred while handling metrics request: ${err}`, {
            label: "metrics",
        });
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).end(err);
    }
}