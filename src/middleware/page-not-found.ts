import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";


export const pageNotFound = (req: Request, res: Response) => {
    const message = 'Page not found'
    res.status(StatusCodes.NOT_FOUND
    ).json({ message: message })
}
