/**
 * @module backend/index
 * @requires express
 * @requires dotenv
 * @requires morgan
 * @requires cors
 * @requires mongoose
 * @requires routes/events
 * @requires routes/users
 * @requires config/database
 * @requires middlewares/index
 * @requires middlewares/logging
 * @description This is the entry point of the application. It contains the server setup and starts the server.
 */

import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import * as userAgent from "express-useragent";

import eventsRoutes from "./routes/events.js";
import usersRoutes from "./routes/users.js";
import connectDb from "./config/database.js";
import { defaultErrorHandler } from "./middlewares/index.js";
import { winstonLoggerStream } from "./middlewares/logging.js";
import authRoutes from "./routes/auth.js";
import paymentRoutes from "./routes/tickets.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Promise rejection:", reason);
});

//Connect to MongoDB
connectDb();

// Middlewares

app.use(userAgent.express());
app.use(express.json());
app.use(cors({ allowedHosts: "localhost:5000" }));
app.use(morgan("combined", { stream: winstonLoggerStream }));
app.use(morgan("dev"));

// Routes

app.use("/api/v1/", defaultErrorHandler, eventsRoutes);
app.use("/api/v1/", defaultErrorHandler, usersRoutes);
app.use("/api/v1/auth/", defaultErrorHandler, authRoutes);
app.use("/api/v1/", defaultErrorHandler, paymentRoutes);

// Start server

mongoose.connection.once("open", (error) => {
  if (error) {
    console.log("Error connecting to MongoDB");
    console.error(error);
  } else {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
});