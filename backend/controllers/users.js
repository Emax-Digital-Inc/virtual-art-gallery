import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import User from "../models/users.js";
import redisClient from "../config/redisConn.js";
import { scanKeys } from "../utils/index.js";
import Event from "../models/exhibitions.js";

dotenv.config();

/**
 * Retrieves users from the database and returns them in a JSON response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Promise} A promise that resolves to a JSON response containing the users.
 */
export const getUsers = async (req, res, next) => {
  try {
    const query = req.query;
    const cacheKey = `api-v1-users-${query}`;
    const users = await User.findAll(query).lean().exec();
    if (users.length > 0) {
      await redisClient.set(cacheKey, JSON.stringify(users), {
        EX: 172800,
        NX: true,
      });
      res.status(200).json({ fromCache: false, message: "Successful", users });
    } else {
      res.status(404).json({ status: 404, message: "No Users found" });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a user by their ID from the database and caches the result.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Promise} A Promise that resolves with the user object or rejects with an error.
 */
export const getUser = async (req, res, next) => {
  try {
    const cacheKey = `api-v1-users-${req.params.id}`;
    const id = req.params.id;
    const user = await User.findById(id).exec();
    if (user) {
      await redisClient.set(cacheKey, JSON.stringify(user), {
        EX: 172800,
        NX: true,
      });
      const userDemographics = await UserDemographics.findOne({
        user: user._id,
      }).populate();
      const events = await Event.find({}).populate();
      const recommendedEvents = await eventListener.emit("userRequested", {
        user: userDemographics,
        events,
      });
      res
        .status(200)
        .json({
          fromCache: false,
          message: "Successful",
          user,
          recommendedEvents,
        });
    } else {
      res.status(404).json({ message: "User does not exist" });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a user in the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Object} The updated user and a success message.
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedUser = req.body;
    const cacheKey = `api-v1-users-${id}`;

    const users = await User.findByIdAndUpdate(id, { ...updatedUser });

    await Promise.all([
      scanKeys("0", "api-v1-users-*"),
      redisClient.del(cacheKey),
      eventListener.emit("updated", users),
    ]);

    return res
      .status(200)
      .json({ message: "Event updated successfully", users });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Promise} A promise that resolves to the response object.
 */
export const deleteUser = async (req, res, next) => {
  try {
    const id = new ObjectId(req.params.id);
    const cacheKey = `api-v1-users-${req.params.id}`;

    const [deletedData] = await Promise.all([
      User.findByIdAndDelete(id),
      redisClient.del(cacheKey),
      scanKeys("0", "api-v1-users-*"),
      eventListener.emit("deleted", deletedData),
    ]);

    return res.status(200).json({
      message: "User deleted successfully",
      deletedData,
    });
  } catch (error) {
    next(error);
  }
};
