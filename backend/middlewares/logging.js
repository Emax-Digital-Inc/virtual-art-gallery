/**
 * @module middlewares/logging
 * @requires winston to log errors to the console and a file.
 * @requires fs to create a logs directory.
 * @requires path to create a logs directory.
 * @requires dotenv to load environment variables.
 * @requires winston-daily-rotate-file to create a new log file every day.
 * @exports logging
 * @exports errorLogger
 * @exports winstonLoggerStream
 * @description This module contains middleware functions for logging errors to the console and a file.
 */

import * as winston from "winston";
import * as rotate from "winston-daily-rotate-file";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

/**
 * @constant {string} logDir - The path to the logs directory.
 * @description The path to the logs directory.
 * @constant {string} errorLog - The path to the errors log file.
 * @description The path to the errors log file.
 * @constant {string} combinedLog - The path to the logs log file.
 * @description The path to the logs log file.
 * @constant {string} exceptionLog - The path to the exceptions log file.
 * @description The path to the exceptions log file.
 * @constant {string} rejectionLog - The path to the rejections log file.
 * @description The path to the rejections log file.
 * @constant {object} errorFileRotateTransport - The error file rotate transport.
 * @description The error file rotate transport.
 * @constant {object} combinedFileRotateTransport - The combined file rotate transport.
 * @description The combined file rotate transport.
 * @constant {object} winstonLogger - The winston logger.
 * @description The winston logger instance.
 */
const logDir = path.join(process.cwd(), "logs");
fs.mkdir(logDir, { recursive: true }).then((err) => {
  if (err) {
    console.log(`Failed to create directory ${logDir}:`, err);
    process.exit(1);
  }
});
const errorLog = path.join(logDir, `errors-`);
const combinedLog = path.join(logDir, `logs-`);
const exceptionLog = path.join(
  logDir,
  `exceptions-${new Date().toISOString().split("T")[0]}.log`
);
const rejectionLog = path.join(
  logDir,
  `rejections-${new Date().toISOString().split("T")[0]}.log`
);
const { combine, timestamp, json } = winston.format;

const errorFileRotateTransport = new winston.transports.DailyRotateFile({
  filename: errorLog + "%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "30d",
  level: "error",
});
const combinedFileRotateTransport = new winston.transports.DailyRotateFile({
  filename: combinedLog + "%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "30d",
});
const winstonLogger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss SSS A",
    }),
    json(
      {
        space: 2,
      },
      {
        replacer: (key, value) => {
          if (key === "password") {
            return undefined;
          }
          return value;
        },
      }
    )
  ),
  transports: [errorFileRotateTransport, combinedFileRotateTransport],
  exceptionHandlers: [new winston.transports.File({ filename: exceptionLog })],
  rejectionHandlers: [new winston.transports.File({ filename: rejectionLog })],
});

/**
 * @constant {object} winstonLoggerStream - The winston logger stream.
 * @param {string} message - The message to log.
 * @returns {void}
 * @description The winston logger stream.
 */
export const winstonLoggerStream = winstonLogger.stream = {
  write: function(message) {
    if (message.includes('error')) {
      winstonLogger.error(message.trim());
    } else {
      winstonLogger.info(message.trim());
    }
  },
};


/**
 * @function logging
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function.
 * @returns {void}
 * @description logs the message to the logs file. 
 */
export const logging = (req, res, next) => {
  winstonLogger.info(
    `${req.method}::${req.originalUrl}::${res.statusCode} - source: ${req.ip}`
  );
  next();
};

/**
 * @function errorLogger
 * @param {Object} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function.
 * @returns {void}
 * @description logs the error to the logs file
 */
export const errorLogger = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errorResponse = {
    error: {
      message: message,
    },
  };
  winstonLogger.error(
    `${req?.method}::${req?.originalUrl}::${statusCode} - source: ${req?.ip} => ${errorResponse.error.message}`
  );
  next && next();
};
