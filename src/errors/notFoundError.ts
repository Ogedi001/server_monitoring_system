import { StatusCodes } from "http-status-codes";
import { CustomError } from "./customError";


export class NotFoundError extends CustomError {
    statusCode = StatusCodes.NOT_FOUND;
    constructor(message: string) {
        super(message)
        //Set every offspring prototype to THIS prototype
        Object.setPrototypeOf(this, NotFoundError.prototype)
    }
    serializeErrors() {
        return [{ message: this.message }]
    }

}