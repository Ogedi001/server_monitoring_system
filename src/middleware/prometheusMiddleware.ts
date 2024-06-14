import { Request, Response, NextFunction } from "express";
import { responseTimeSummary, httpRequestCounter, error_httpRequestCounter, success_httpRequestCounter, } from "../controller/monitoring-controller";


// Middleware to track route hits or calls
export function trackHttpRequest(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
        const label = {
            route: req.path,
            method: req.method,
            status_code: res.statusCode.toString()
        }
        // Increment httpRequestCounter for all requests
        httpRequestCounter.inc(label);

        if (res.statusCode >= 400) {
            error_httpRequestCounter.inc(label);
        } else {
            success_httpRequestCounter.inc(label)
        }
    })
    next();
}

// Middleware to measure response time (Manually)
// export function measureResponseTime(req: Request, res: Response, next: NextFunction) {
//     const req_startTime = process.hrtime();

//     res.on('finish', () => {
//         const res_duration = process.hrtime(req_startTime);
//         //add seconds duration and nanoseconds suration
//         const seconds = res_duration[0] + res_duration[1] / 1000000000  //same as 1e9;

//         responseTimeSummary.labels(req.method, req.route?.path || req.path, res.statusCode.toString()).observe(seconds);
//     });

//     next();
// }

// Middleware to measure response time (Automatically using Histogram )
// export function measureResponseTime(req: Request, res: Response, next: NextFunction) {
//     const end = responseTimeSummary.startTimer(); // Use responseTimeSummary

//     res.on('finish', () => {
//         const duration = end(); // Stop the timer and get the duration
//         const seconds = duration[0] + duration[1] / 1e9;

//         responseTimeSummary.labels(req.method, req.route?.path || req.path, res.statusCode.toString()).observe(seconds);
//     });

//     next();
// }

// Middleware to measure response time
export function measureResponseTime(req: Request, res: Response, next: NextFunction) {
    // Start the timer without labels
    const end = responseTimeSummary.startTimer();

    res.on('finish', () => {
        // Stop the timer and record the duration with labels
        // The 'end' function will automatically observe the elapsed time and attach the labels
        end({ method: req.method, route: req.route?.path || req.path, status_code: res.statusCode.toString() });
    });

    next();
}
