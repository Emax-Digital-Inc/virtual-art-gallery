import redisClient from "../config/redisConn.js";

export async function getAttendeesCacheData(req, res, next) {
  try {
    const cacheKey = `api-v1-reports-attendance-${JSON.stringify(req.query)}`;
    const countAttendees = await redisClient.get(cacheKey);

    if (!countAttendees) {
      next();
      return;
    }

    res.send({
      fromCache: true,
      message: "Successful",
      event: JSON.parse(countAttendees),
    });
  } catch (error) {
    next(error);
  }
}