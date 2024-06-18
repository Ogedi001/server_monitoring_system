import "dotenv/config";
import "express-async-errors";
import express, { Request, Response, Application } from "express";
import { createServer } from "http";


import cors from 'cors'
import { StatusCodes } from "http-status-codes";



import Logger from "./logger";
import { ApplicationRoute } from "./routes";
import { errorHandlerMiddleware, measureResponseTime, pageNotFound, trackHttpRequest } from "./middleware";
import { handleMetricsRequest } from "./controller/monitoring-controller";
import { test1, test2 } from "./controller/dummy-controller";


const app: Application = express();



const server = createServer(app);
const PORT = process.env.PORT || 4050;


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

  app.use(measureResponseTime);
  app.use(trackHttpRequest);
  app.get("/api", (req: Request, res: Response) => {
    console.log(req.path)
    return res
      .status(StatusCodes.OK)
      .json({ message: "Welcome to Backend Api version 1.0 🔥🔥🔥" });
  });

  app.get("/api/test1", test1)
  app.get("/api/test2", test2)
  app.get('/metrics', handleMetricsRequest)
  app.use("/api", ApplicationRoute);


  app.use(errorHandlerMiddleware);
  app.use(pageNotFound);

  server.listen(PORT, () => {
    Logger.info(`App is running @localhost:${PORT}`);
  });

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
