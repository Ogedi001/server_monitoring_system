//abstract class can't be instantited, basically stand as blueprint for other class
export abstract class CustomError extends Error {
    //abstract property must be implemented by offspring
    abstract statusCode: number
    constructor(message: string) {
        super(message)
        //Set every offspring prototype to CustomError prototype
        Object.setPrototypeOf(this, CustomError.prototype)
    }

    //abstract method must be implemented by offspring
    abstract serializeErrors(): { message: string; fields?: string }[]
}