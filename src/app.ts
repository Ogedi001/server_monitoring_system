import "dotenv/config";
import "express-async-errors";
import express, { Request, Response, Application } from "express";
import { createServer } from "http";
import cluster from 'cluster'
import os from 'node:os'
import process from 'process'
import cors from 'cors'
import { StatusCodes } from "http-status-codes";
import promClient from "prom-client";


import Logger from "./logger";
import { ApplicationRoute } from "./routes";
import { errorHandlerMiddleware, pageNotFound } from "./middleware";
import { handleClusterMetricsRequest, handleMetricsRequest } from "./controller/monitoring-controller";


const numCPUs = os.availableParallelism()
const app: Application = express();



const server = createServer(app);
const PORT = process.env.PORT || 4050;

// Enable default metrics collection
promClient.collectDefaultMetrics();
const metricsServer = createServer(app);
const METRICS_PORT = process.env.METRICS_PORT || 4051;

const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['OPTIONS', 'POST', 'GET'],
  allowedHeaders: ['X-Requested-With', 'X-Auth-Token', 'Content-Type', 'Content-Length', 'Authorization', 'Access-Control-Allow-Headers', 'Accept'],
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const startServer = () => {

  if (cluster.isPrimary) {
    Logger.info(`Primary cluster ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    app.get('/metrics', handleClusterMetricsRequest)

    cluster.on('exit', (worker, code, signal) => {
      Logger.info(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}. Forking a new worker...`);
      cluster.fork();
    });

    // Start the metrics server

    metricsServer.listen(METRICS_PORT, () => {
      Logger.info(`Cluster metrics server listening on port ${METRICS_PORT}, metrics exposed on /cluster_metrics`);
    });

  } else {

    app.get("/api", (req: Request, res: Response) => {
      return res
        .status(StatusCodes.OK)
        .json({ message: "Welcome to Backend Api version 1.0 🔥🔥🔥" });
    });

    app.get('/metrics', handleMetricsRequest)

    app.use("/api", ApplicationRoute);
    app.use(errorHandlerMiddleware);
    app.use(pageNotFound);

    server.listen(PORT, () => {
      Logger.info(`App is running @localhost:${PORT}: Worker ${process.pid} started`);
    });
  }


  const shutdown = () => {
    server.close(() => {
      Logger.info("Server is shut down");
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

startServer();
