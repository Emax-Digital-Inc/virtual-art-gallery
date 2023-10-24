import jwt from "jsonwebtoken";
import User from "../models/users.js";
import dotenv from "dotenv";
import { errorLogger } from "./logging.js";

dotenv.config();

/**
 * Verify JWT token and add user to request.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} - Promise resolving to the next middleware.
 * @description Verify JWT token and add user to request.
 */
export const verifyJWT = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorised" });
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorised" });
  }
};

/**
 * Require admin role for route access.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware.
 * @returns {Promise} - Promise resolving to the next middleware.
 * @description Require admin role for route access.
 */
export const requireAdmin = async (req, res, next) => {
  const { role } = req.user;
  if (role !== "admin") {
    errorLogger({ statusCode: 403, message: "Forbidden" }, req, res);
    return res.status(403).json({ error: "Forbidden" });
  }
  return next();
};

/**
 * Require organizer or admin role for route access.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise} - Promise resolving to the next middleware or an error response.
 * @description Require organizer role for route access.
 */
export const requireOrganizer = async (req, res, next) => {
  const { role } = req.user;
  if (role === "organizer" || role === "admin") return next();
  errorLogger({ statusCode: 403, message: "Forbidden" }, req, res);
  return res.status(403).json({ error: "Forbidden" });
};

/**
 * Require admin or owner role for route access.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise} - Promise resolving to the next middleware or an error response.
 * @description Require admin or owner role for route access.
 */
export const requireAdminOrOwner = async (req, res, next) => {
  const { role, _id } = req.user;
  const { id } = req.params;

  if (role === "admin" || _id === id) {
    return next();
  }

  const error = {
    statusCode: 403,
    message: "Forbidden",
  };

  errorLogger(error, req, res);
  return res.status(403).json({ error: error.message });
};

export const roleAuth = async (req, res, next) => {
  try {
    // const refreshToken = req.cookies?.refreshToken;
    const token = req.header("Authorization").replace("Bearer ", "");
    console.log("refreshToken: ", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("decoded: ", decoded);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
      admin: true,
    });
    console.log("User role token: ", user);

    if (!(user.role == "admin" || user.role == "organizer")) {
      errorLogger({ statusCode: 401, message: "Unauthorized" }, req, res);
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  } catch (e) {
    res.status(401).send(e);
  }
};
