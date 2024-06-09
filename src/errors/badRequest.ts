import { StatusCodes } from "http-status-codes";
import { CustomError } from "./customError";


export class BadRequestError extends CustomError {
    statusCode = StatusCodes.BAD_REQUEST;
    constructor(message: string) {
        super(message)
        //Set every offspring prototype to THIS prototype
        Object.setPrototypeOf(this, BadRequestError.prototype)
    }
    serializeErrors() {
        return [{ message: this.message }]
    }

}