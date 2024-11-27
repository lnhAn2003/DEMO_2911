import { createLogger, format, transports, Logger } from "winston";

const logger: Logger = createLogger({
    level: "debug",
    format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.printf(({ level, message, timestamp }) => {
            if (typeof message === 'object') {
                message = JSON.stringify(message, null, 2); 
            }
            return `[${timestamp}] [${level}] ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: "application.log" }),
    ],
});

export default logger;
