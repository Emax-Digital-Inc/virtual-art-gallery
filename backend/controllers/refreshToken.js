/**
 * @module controllers/refreshToken
 * @requires jsonwebtoken
 * @requires models/User
 * @exports handleRefreshToken
 * @description Refreshes the user's token
 */

import jwt from "jsonwebtoken";
import User from "../models/users.js";
import dotenv from "dotenv";
import { errorLogger} from "../middlewares/logging.js";

dotenv.config();

/**
 * @function handleRefreshToken
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {Object} - The response object
 * @description Refreshes the user's token. Get the refresh token from the httpOnly cookie and verify it. If it is valid, get the user's id from the payload and find the user in the database. If the user is found, generate a new token and send it back to the client. If the user is not found, throw an error and pass it on to the default error handler through the next middleware function.
 */
export const handleRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      errorLogger({statusCode: 401, message: "Unauthorized"}, req, res);
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    if (!payload) {
      errorLogger({statusCode: 401, message: "Unauthorized"}, req, res);
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(payload._id);

    if (!user) {
      errorLogger({statusCode: 403, message: "Forbidden"}, req, res);
      return res.status(403).json({ message: "Forbidden" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role, email: user.email },
      process.env.TOKEN_SECRET
    );

    res.cookie("refreshToken", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    const responseData = {
      status: 200,
      token,
      user: { id: user._id, email: user.email, role: user.role },
    };

    return res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};
