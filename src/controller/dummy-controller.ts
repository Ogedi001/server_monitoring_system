
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Logger from "../logger";


// Dummy endpoints for testing
export function test1(req: Request, res: Response) {
    console.log(req.originalUrl)
    console.log(req.url)
    console.log(req.path)
    setTimeout(() => {
        res.status(StatusCodes.OK).json({ message: "Test endpoint 1 response" });
    }, 100); // Simulate some processing delay
}

export function test2(req: Request, res: Response) {
    setTimeout(() => {
        res.status(StatusCodes.OK).json({ message: "Test endpoint 2 response" });
    }, 200); // Simulate some processing delay
}