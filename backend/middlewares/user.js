import redisClient from "../config/redisConn.js";

/**
 * Check users in cache
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {Promise} -  A promise that resolves with the data from cache or a call to next
 * @description - Check if the user is in cache
 */
export const getUsersFromCache = async (req, res, next) => {
  try {
    const query = req.query;
    const cacheKey = `api-v1-users-${query}`;
    const users = await redisClient.get(cacheKey);

    if (users) {
      return res.status(200).json(JSON.parse(users));
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Check Individual user from cache
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {Promise} -  A promise that resolves with the data from cache or a call to next
 * @description - Check if the user is in cache
 */
export const getUserFromCache = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `api-v1-user-${id}`;
    const user = await redisClient.get(cacheKey);

    if (user) {
      return res.status(200).json(JSON.parse(user));
    }

    next();
  } catch (error) {
    next(error);
  }
}

