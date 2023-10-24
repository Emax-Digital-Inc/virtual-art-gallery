/**
 * @module backend/utils
 * @requires jsonwebtoken
 * @requires dotenv
 * @requires ../config/redisConn
 * @description Defines functions for generating access and refresh tokens.
 */

import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import redisClient from "../config/redisConn.js";

dotenv.config();

/**
 * Generates access and refresh tokens for a given user.
 *
 * @param {object} user - The user object containing email and id.
 * @return {object} - An object containing the access token and refresh token.
 */
export const generateTokens = (user) => {
  const { email, _id } = user;

  const accessToken = jwt.sign(
    { email, id: _id },
    process.env.ACCESS_SECRET,
    { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
    { email, id: _id },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}

/**
 * Scans the Redis keys starting from the given cursor and deletes all keys that match the pattern "api-v1-users-*".
 *
 * @param {string} cursor - The cursor to start scanning from.
 * @return {Promise<void>} A promise that resolves once all matching keys have been deleted.
 */
export const scanKeys = async (cursor, glob) => {
  let newCursor = cursor;

  do {
    const { cursor: replyCursor, keys } = await redisClient.scan(newCursor, "MATCH", glob);

    if (!replyCursor || !keys) {
      console.log('scan reply does not have expected properties');
      break;
    }

    newCursor = replyCursor;

    if (keys.length > 0) {
      await redisClient.del(...keys);
    }

  } while (newCursor !== 0);
};
