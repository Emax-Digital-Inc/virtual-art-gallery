/**
 * @module config/database
 * @requires mongoose to connect to the database.
 * @requires dotenv to load environment variables from a .env file.
 * @requires middlewares/logging to log errors to the to a file.
 * @exports connectDb  which when called, attempts to connect to the database.
 * @description This module is responsible for establishing a connection to the MongoDB database using the mongoose library.
 * The database URL is fetched from these environment variables.
 * If the connection is successful, it resolves a promise, and if there is an error during connection, it logs the error to the console and the promise is rejected.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { errorLogger } from "../middlewares/logging.js";

dotenv.config();

/**
 * @function connectDb
 * @async
 * @description Connect to the MongoDB database using mongoose. The database URL is fetched from environment variables. It also sets the 'strictQuery' option of mongoose to true.
 * @returns {Promise<void>} Returns a promise that resolves when the connection is established. If there is an error during connection, it is logged to the console and the promise is rejected.
 */
const connectDb = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.DB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
  } catch (err) {
    errorLogger(err);
    console.error(err);
  }
};

/**
 * @exports connectDb
 */
export default connectDb;
