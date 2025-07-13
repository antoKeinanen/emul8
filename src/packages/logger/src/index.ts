import winston from "winston";

import { env } from "./env";

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: env.NODE_ENV == "DEV" ? winston.format.cli() : winston.format.json(),
  transports: [new winston.transports.Console()],
} as winston.LoggerOptions);

export default logger;
