/**
 * @module controllers/sessions
 * @requires models/sessions
 * @swagger definitions
 * - name: Session
 * description: Session object
 * properties: {
 * name: {type: String},
 * event: {type: String},
 * startTime: {type: Date},
 * endTime: {type: Date},
 * }
 * required: [name, event, startTime, endTime]
 * example: {
 * _id: "5f7f5c5f4f1d9e2b7c9d4efd",
 * name: "Session 1",
 * event: "5f7f5c5f4f1d9e2b7c9d4f1d",
 * startTime: "2020-10-07T00:00:00.000+00:00",
 * endTime: "2020-10-07T00:00:00.000+00:00",
 * }
 */
import e from "express";
import Session from "../models/sessions.js";

/**
 * @function getSessions
 * @description Get all sessions
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {object} - Array of sessions
 *
 * @method GET /sessions
 * @example const response = await axios.get("/api/v1/sessions")
 * @example response.status => 200
 * @example response.data => [
 * {
 *  _id: "5f7f5c5f4f1d9e2b7c9d4efd",
 *  name: "Session 1",
 *  event: "5f7f5c5f4f1d9e2b7c9d4f1d",
 *  startTime: "2020-10-07T00:00:00.000+00:00",
 *  endTime: "2020-10-07T00:00:00.000+00:00"
 * },
 * ]
 */
export const getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find();
    if (sessions.length > 0) {
      res.status(200).json(sessions);
    } else {
      res.status(404).json({ message: "No sessions found" });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @function createSession
 * @description Create a new session
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {object} - New session
 * @throws Will throw an error if session already exists
 *
 * @method POST /sessions
 * @example const response = await axios.post("/api/v1/sessions", {
 *  name: "Session 1",
 *  event: "5f7f5c5f4f1d9e2b7c9d4f1d",
 *  startTime: "2020-10-07T00:00:00.000+00:00",
 *  endTime: "2020-10-07T00:00:00.000+00:00"
 * })
 * @example response.status => 201
 * @example response.data => {
 * _id: "5f7f5c5f4f1d9e2b7c9d4efd",
 * name: "Session 1",
 * event: "5f7f5c5f4f1d9e2b7c9d4f1d",
 * startTime: "2020-10-07T00:00:00.000+00:00",
 * endTime: "2020-10-07T00:00:00.000+00:00"
 * }
 */
export const createSession = async (req, res, next) => {
  const session = req.body;
  if (
    !session.name ||
    !session.event ||
    !session.startTime ||
    !session.endTime
  ) {
    res.status(400).json({ message: "Missing required field" });
    return;
  }
  try {
    const existingSession = await Session.findOne({
      name: session.name,
      event: session.event,
    });
    if (existingSession) {
      res.status(409).json({ message: "Session already exists" });
      return;
    }
    const newSession = await Session.create(session);
    res.status(201).json(newSession);
  } catch (error) {
    next(error);
  }
};

/**
 * @function getSession
 * @description Get a session by id
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {object} - Session
 * @throws Will throw an error if session is not found
 *
 * @method GET /sessions/:id
 * @example const response = await axios.get("/api/v1/sessions/5f7f5c5f4f1d9e2b7c9d4efd")
 * @example response.status => 200
 * @example response.data => {
 * _id: "5f7f5c5f4f1d9e2b7c9d4efd",
 * name: "Session 1",
 * event: "5f7f5c5f4f1d9e2b7c9d4f1d",
 * startTime: "2020-10-07T00:00:00.000+00:00",
 * endTime: "2020-10-07T00:00:00.000+00:00"
 * }
 */
export const getSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (session) {
      res.status(200).json(session);
    } else {
      res.status(404).json({ message: "Session not found" });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @function updateSession
 * @description Update a session by id
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {object} - Updated session
 * @throws Will throw an error if session is not found
 * 
 * @method PATCH /sessions/:id
 * @example const response = await axios.patch("/api/v1/sessions/5f7f5c5f4f1d9e2b7c9d4efd", {name: "Session 1", event: "5f7f5c5f4f1d9e2b7c9d4f1d", startTime: "2020-10-07T00:00:00.000+00:00", endTime: "2020-10-07T00:00:00.000+00:00"})
 * @example response.status => 200
 * @example response.data => {
 * _id: "5f7f5c5f4f1d9e2b7c9d4efd",
 * name: "Session 1",
 * event: "5f7f5c5f4f1d9e2b7c9d4f1d",
 * startTime: "2020-10-07T00:00:00.000+00:00",
 * endTime: "2020-10-07T00:00:00.000+00:00"
 * }
 */
export const updateSession = async (req, res, next) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (session) {
      res.status(200).json(session);
    } else {
      res.status(404).json({ message: "Session not found" });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @function deleteSession
 * @description Delete a session by id
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws Will throw an error if session is not found
 *
 * @method DELETE /sessions/:id
 * @example const response = await axios.delete("/api/v1/sessions/5f7f5c5f4f1d9e2b7c9d4efd")
 * @example response.status => 204
 */
export const deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (session) {
      res.status(204).json({});
    } else {
      res.status(404).json({ message: "Session not found" });
    }
  } catch (error) {
    next(error);
  }
};
