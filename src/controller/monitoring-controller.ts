import promClient, { Counter, Summary, Gauge, Histogram, AggregatorRegistry } from "prom-client";
import os from 'os'
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Logger from "../logger";


const aggregatorRegistry = new AggregatorRegistry();




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

const uptimeGauge = new Gauge({
    name: 'server_uptime_minutes',
    help: 'Server uptime in minutes, updated every 5 minutes',
});


const loadGauge = new Gauge({
    name: 'server_load_average',
    help: 'Server load average over the last 1, 5, and 15 minutes',
    labelNames: ['interval'],
});

export const responseTimeSummary = new Summary({
    name: 'http_response_time_seconds',
    help: 'Response time in seconds',
    labelNames: ['method', 'route', 'status_code'],
    percentiles: [0.01, 0.1, 0.9, 0.95, 0.99],
});

function getSystemUptimeMinutes() {
    const uptimeSeconds = process.uptime();
    return uptimeSeconds / 60;
}


function updateUptimeMetric() {
    const uptimeMinutes = getSystemUptimeMinutes();
    uptimeGauge.set(uptimeMinutes);
    Logger.info(`Server uptime updated: ${uptimeMinutes} minutes`);
}

function updateLoadMetric() {
    const loadAverages = os.loadavg();
    loadGauge.set({ interval: '1m' }, loadAverages[0]);
    loadGauge.set({ interval: '5m' }, loadAverages[1]);
    loadGauge.set({ interval: '15m' }, loadAverages[2]);
    Logger.info(`Server load averages updated: 1m=${loadAverages[0]}, 5m=${loadAverages[1]}, 15m=${loadAverages[2]}`);
}




setInterval(updateUptimeMetric, 300000);
setInterval(updateLoadMetric, 300000);





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
