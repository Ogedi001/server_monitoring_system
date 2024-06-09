import winston from 'winston';
import LokiTransport from 'winston-loki'
const { combine, timestamp, colorize, json } = winston.format;


const transports = [
    // Log to the console(transport log to console)
    new winston.transports.Console({
        format: colorize({ all: true })
    }),

]


// Define your Winston logger configuration
const Logger = winston.createLogger({

    level: 'debug', // Set the log level(this record message from this level to higher up)
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
        json()
    ),
    transports
});

Logger.add(new LokiTransport({
    host: 'http://127.0.0.1:3100',
    json: true,
    //basicAuth: 'username:password',
    labels: { job: 'winston-loki-node-app-example' }
}))

export default Logger