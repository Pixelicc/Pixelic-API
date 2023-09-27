import chalk from "chalk";
import winston from "winston";
import "winston-daily-rotate-file";

const infoTransport = new winston.transports.DailyRotateFile({
  level: "info",
  filename: "./logs/info-%DATE%.log",
  datePattern: "YYYY-MM-DD-HH",
  maxFiles: "7d",
});

const warningTransport = new winston.transports.DailyRotateFile({
  level: "warn",
  filename: "./logs/warning-%DATE%.log",
  datePattern: "YYYY-MM-DD-HH",
  maxFiles: "7d",
});

const errorTransport = new winston.transports.DailyRotateFile({
  level: "error",
  filename: "./logs/error-%DATE%.log",
  datePattern: "YYYY-MM-DD-HH",
  maxFiles: "7d",
});

const logger = winston.createLogger({ format: winston.format.json(), transports: [infoTransport, warningTransport, errorTransport] });

export default (service: string, message: string, level: "info" | "warn" | "error", extra?: object) => {
  const date = `[${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}:${String(new Date().getSeconds()).padStart(2, "0")}]`;

  if (level === "info") console.log(`${chalk.white(date)} [${chalk.green(service)}] » ${chalk.blue(message)}`);
  if (level === "warn") console.log(`${chalk.white(date)} [${chalk.green(service)}] » ${chalk.yellow(message)}`);
  if (level === "error") console.log(`${chalk.white(date)} [${chalk.green(service)}] » ${chalk.red(message)}`);

  logger.log({
    time: new Date().toJSON(),
    level,
    service,
    message,
    extra,
  });
};
