import winston from 'winston';
const { combine, printf } = winston.format;



// Define custom colors for different log levels
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};





winston.addColors(colors);

//combine multiple formatting options
const format = combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    // Add colorizing formatter
    winston.format.colorize({ all: true }),
    //Define the log message format
    printf((info) => {
        //return to log console, timestap,log level and log timestamp
        return `${info.timestamp} [${info.level}]: ${info.message}`;
    })
)

const transports = [
    // Log to the console(transport log to console)
    new winston.transports.Console(),

]


// Define your Winston logger configuration
const Logger = winston.createLogger({

    level: 'debug', // Set the log level(this record message from this level to higher up)

    format,
    transports
});

export default Logger