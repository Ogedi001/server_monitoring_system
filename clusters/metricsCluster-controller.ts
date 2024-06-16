import promClient, { Counter, Summary, Gauge, Histogram, AggregatorRegistry } from "prom-client";
import os from 'os'
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Logger from "../logger";
import { checkSystemHealth, disksInfo } from "../utils/healthCheck-utils";


const aggregatorRegistry = new AggregatorRegistry();



//http metrics
export const httpRequestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests processed',
    labelNames: ['method', 'route', 'status_code'],
});

export const error_httpRequestCounter = new promClient.Counter({
    name: 'http_request_errors_total',
    help: 'Total number of HTTP request errors',
    labelNames: ['method', 'route', 'status_code']
});

export const success_httpRequestCounter = new promClient.Counter({
    name: 'http_request_success_total',
    help: 'Total number of successful HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

export const responseTimeSummary = new Summary({
    name: 'http_response_time_seconds',
    help: 'Response time in seconds',
    labelNames: ['method', 'route', 'status_code'],
    percentiles: [0.01, 0.1, 0.9, 0.95, 0.99],
});

//System Availability metrics

const uptimeCounter = new promClient.Counter({
    name: 'system_uptime_checks_total',
    help: 'Total number of uptime checks'
});

const downtimeCounter = new promClient.Counter({
    name: 'system_downtime_checks_total',
    help: 'Total number of downtime checks'
});

const availabilityGauge = new promClient.Gauge({
    name: 'system_availability_percentage',
    help: 'System availability percentage'
});

//resources Availability

//disk usage checks
const totalDiskSpaceGauge = new promClient.Gauge({
    name: 'disk_space_total_bytes',
    help: 'Total disk space in bytes',
});
const usedDiskSpaceGauge = new promClient.Gauge({
    name: 'disk_space_used_bytes',
    help: 'Used disk space in bytes',
});
const freeDiskSpaceGauge = new promClient.Gauge({
    name: 'disk_space_free_bytes',
    help: 'Free disk space in bytes',
});

const availableDiskSpaceGauge = new promClient.Gauge({
    name: 'custom_disk_space_available_bytes',
    help: 'Available disk space in bytes',
});

const diskUsagePercentageGauge = new promClient.Gauge({
    name: 'disk_usage_percentage',
    help: 'Disk usage percentage',
});




const networkUsageGauge = new promClient.Gauge({
    name: 'custom_network_usage_bytes',
    help: 'Network usage in bytes',
});

const loadGauge = new Gauge({
    name: 'server_load_average',
    help: 'Server load average over the last 1, 5, and 15 minutes',
    labelNames: ['interval'],
});



function updateLoadMetric() {
    const loadAverages = os.loadavg();
    loadGauge.set({ interval: '1m' }, loadAverages[0]);
    loadGauge.set({ interval: '5m' }, loadAverages[1]);
    loadGauge.set({ interval: '15m' }, loadAverages[2]);
    Logger.info(`System load averages updated: 1m=${loadAverages[0]}, 5m=${loadAverages[1]}, 15m=${loadAverages[2]}`);
}


setInterval(updateLoadMetric, 300000);
setInterval(async () => {
    //Availability metrics
    if (checkSystemHealth()) {
        uptimeCounter.inc();
    } else {
        downtimeCounter.inc();
    }

    const downtimeCountValue = (await downtimeCounter.get()).values[0].value
    const uptimeCountValue = (await uptimeCounter.get()).values[0].value
    // Calculate availability
    const totalCountValue = downtimeCountValue + uptimeCountValue
    const availability = (uptimeCountValue / totalCountValue) * 100;
    availabilityGauge.set(availability);
    Logger.info(`System availability updated: ${availability} %`, { label: 'metrics' });

    //disk usage guage metrics
    totalDiskSpaceGauge.set((await disksInfo())?.total!);
    usedDiskSpaceGauge.set((await disksInfo())?.used!);
    freeDiskSpaceGauge.set((await disksInfo())?.free!);
    availableDiskSpaceGauge.set((await disksInfo())?.available!);
    diskUsagePercentageGauge.set((await disksInfo())?.usagePercentage!);
    console.log((await disksInfo())?.usagePercentage!)
}, 60000);


// Enable default metrics collection
promClient.collectDefaultMetrics();



export async function handleMetricsRequest(_: Request, res: Response) {
    try {
        res.set('Content-Type', promClient.register.contentType);
        res.end(await promClient.register.metrics());
    } catch (err) {
        Logger.error(`An error occurred while handling metrics request: ${err}`, { label: 'metrics' });
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).end(err);
    }
}


export async function handleClusterMetricsRequest(_: Request, res: Response) {
    try {
        //gatter metrics from all node worker clusters
        const metrics = await aggregatorRegistry.clusterMetrics();
        res.set('Content-Type', aggregatorRegistry.contentType);
        res.send(metrics);
    } catch (err: unknown) {
        Logger.error(`An error occurred while handling metrics request: ${err}`, { label: 'metrics' });
        if (err instanceof Error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
        }
    }
}

// if (cluster.isWorker) {
//     // Expose some worker-specific metric as an example
//     setInterval(() => {
//         c.inc({ code: `worker_${cluster.worker.id}` });
//     }, 2000);
// }
