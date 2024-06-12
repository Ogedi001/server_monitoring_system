import { Request, Response, NextFunction } from "express";
import { routeCallsCounter } from "../controller/monitoring-controller";


// Middleware to track route hits or calls
export function trackRouteCalls(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
        routeCallsCounter.inc({
            route: req.path,
            method: req.method,
            status_code: res.statusCode
        });
    })
    next();
}