import pino from 'pino';
import pretty from "pino-pretty";

const stream = pretty({
    levelFirst: true,
    colorize: true,
    ignore: "time,hostname,pid",
});

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            require: true,
            colorize: true,
            levelFirst: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
        },
    },
    stream
});

export default logger;