import redisClient from "../config/redisConn.js";

/**
 * @param {HTTP Request} req HTTP Request
 * @param {HTTP Response} res HTTP Response
 * @param {Next Function} next Next function
 * @returns HTTP Response with status 200 with all event on success
 * @returns HTTP Response with status 404 with error message no event found
 * @returns A call to next() on internal server error
 *
 * @description This function gets all events from the cache database.
 * It first checks if the required fields are present in the request body.
 * If the required fields are present, it retrieves the events from the cache.
 * If the events are found in the cache, it sends a response with the events.
 * If the events are not found in the cache, it forwards the request to the next function to retrieve events from the database.
 */
export async function getEventsCacheData(req, res, next) {
  try {
    const query = req.query;

    // Convert query parameters to match schema types
    if (query.isFeatured) query.isFeatured = query.isFeatured === "true";
    if (query.isFree) query.isFree = query.isFree === "true";
    if (query.isOnline) query.isOnline = query.isOnline === "true";
    if (query.price) query.price = Number(query.price);

    // Case-insensitive search for title or description
    if (query.title) query.title = { $regex: new RegExp(query.title, "i") };
    if (query.description)
      query.description = { $regex: new RegExp(query.description, "i") };
    // Date filtering
    if (query.startDate) query.startDate = { $gte: new Date(query.startDate) };
    if (query.endDate) query.endDate = { $lte: new Date(query.endDate) };

    // Create a unique cache key for this query
    const cacheKey = `api-v1-events-${JSON.stringify(query)}`;
    const event = await redisClient.get(cacheKey);
    if (event) {
      const eventResponse = JSON.parse(event);
      res.send({
        fromCache: true,
        message: "Successful",
        data: eventResponse,
      });
    } else {
      req.query = query;
      next();
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Get an event by id from the cache database.
 *
 * @param {HTTP Request} req - HTTP Request
 * @param {HTTP Response} res - HTTP Response
 * @param {Next Function} next - Next function
 *
 * @returns {HTTP Response} HTTP Response with status 200 and event data on success
 * @returns {HTTP Response} HTTP Response with status 404 and error message if event is not found
 * @returns {Function} A call to next() on internal server error
 */
export async function getEventCacheData(req, res, next) {
  try {
    const cacheKey = `api-v1-events-${req.params.id}`;

    const event = await redisClient.get(cacheKey);
    eventListener.emit("visit", event);



    if (!event) {
      next();
      return;
    }
    eventListener.emit("eventVisited", {
      data: JSON.parse(event),
      user: req?.user?.id,
    });
    res.send({
      fromCache: true,
      message: "Successful",
      event: JSON.parse(event),
    });
  } catch (error) {
    next(error);
  }
}
