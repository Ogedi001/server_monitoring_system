import { StatusCodes } from "http-status-codes";

import { Response, Request, NextFunction } from "express";
import { CustomError } from "../errors";
import Logger from "../logger";


export const errorHandlerMiddleware = async (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof CustomError) {
        Logger.error(err.serializeErrors());
        return res.status(err.statusCode).json({ errors: err.serializeErrors() });
    }



    // Other uncaught errors
    Logger.error({
        message: "Internal server error",
        error: err.message,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        errors: [{ message: err.message }],
    });
};
