import promClient, { Counter, Summary, Gauge, Histogram } from "prom-client";

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AggregatorRegistry } from "prom-client";

const aggregatorRegistry = new AggregatorRegistry();




export async function handleMetricsRequest(_: Request, res: Response) {
    try {
        res.set('Content-Type', promClient.register.contentType);
        res.end(await promClient.register.metrics());
    } catch (err) {
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
