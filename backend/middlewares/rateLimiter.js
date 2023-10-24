import moment from "moment";
import redisClient from "../config/redisConn.js";
import { errorLogger } from "./logging.js";

const WINDOW_SIZE_IN_HOURS = 24;
const MAX_WINDOW_REQUEST_COUNT = 5;
const WINDOW_LOG_INTERVAL_IN_HOURS = 1;

/**
 * A function that implements a custom Redis rate limiter.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Promise} Resolves when the function is complete.
 */
export const customRedisRateLimiter = async (req, res, next) => {
  try {
    if (!redisClient) {
      throw new Error("Redis client does not exist!");
    }

    const record = await redisClient.get(req.ip);
    const currentRequestTime = moment();

    if (record == null) {
      const newRecord = [
        {
          requestTimeStamp: currentRequestTime.unix(),
          requestCount: 1,
        },
      ];
      await redisClient.set(req.ip, JSON.stringify(newRecord));
      return next();
    }

    const data = JSON.parse(record);
    const windowStartTimestamp = moment()
      .subtract(WINDOW_SIZE_IN_HOURS, "hours")
      .unix();
    const requestsWithinWindow = data.filter(
      (entry) => entry.requestTimeStamp > windowStartTimestamp
    );
    const totalWindowRequestsCount = requestsWithinWindow.reduce(
      (accumulator, entry) => accumulator + entry.requestCount,
      0
    );

    if (totalWindowRequestsCount >= MAX_WINDOW_REQUEST_COUNT) {
      errorLogger(
        {
          statusCode: 429,
          message: `You have exceeded the ${MAX_WINDOW_REQUEST_COUNT} requests in ${WINDOW_SIZE_IN_HOURS} hrs limit!`,
        },
        req,
        res,
        next
      );
      return res.status(429).json({
        message: `You have exceeded the ${MAX_WINDOW_REQUEST_COUNT} requests in ${WINDOW_SIZE_IN_HOURS} hrs limit!`,
      });
    }

    const lastRequestLog = data[data.length - 1];
    const potentialCurrentWindowIntervalStartTimeStamp = currentRequestTime
      .subtract(WINDOW_LOG_INTERVAL_IN_HOURS, "hours")
      .unix();

    if (
      lastRequestLog.requestTimeStamp >
      potentialCurrentWindowIntervalStartTimeStamp
    ) {
      lastRequestLog.requestCount++;
    } else {
      data.push({
        requestTimeStamp: currentRequestTime.unix(),
        requestCount: 1,
      });
    }

    await redisClient.set(req.ip, JSON.stringify(data));
    return next();
  } catch (error) {
    return next(error);
  }
};

