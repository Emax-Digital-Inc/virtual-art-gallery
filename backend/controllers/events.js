/**
 * @module controllers/events
 * @requires dotenv
 * @requires models/events
 * @requires mongodb
 * @requires events/listeners
 * @description This module contains functions for handling events. It exports the following functions:
 * @exports function:createEvent
 * @exports function:getEvents
 * @exports function:getEvent
 * @exports function:updateEvent
 * @exports function:deleteEvent
 * @exports function:joinEvent
 */
import dotenv from "dotenv";
import Event from "../models/exhibitions.js";
import { ObjectId } from "mongodb";
import redisClient from "../config/redisConn.js";
import { scanKeys } from "../utils/index.js";

dotenv.config();

/**
 * @function createEvent
 * @param {import('express').Request} req HTTP Request
 * @param {import('express').Response} res HTTP Response
 * @param {import('express').NextFunction} next Next function
 * @returns {import('express').Response} HTTP Response with status 201 and the created event on success
 * @throws {Error} HTTP Response with status 400 and error message on invalid request
 * @throws {Error} A call to next() on internal server error
 *
 * @description This function creates an event and saves it to the database.
 * It first grabs the data from the request body and then checks if the required fields are present.
 * If the required fields are present, it tries to create the event and save it to the database.
 * After successfully saving it, it deletes the cache memory.
 * If the required fields are not present, it throws an error to be handled by the error handlers through the next() function.
 * If the event is successfully created and saved to the database, it returns a success message and the created event.
 * After an event has been created, it triggers an event that makes an API call to the AI service.
 */
export const createEvent = async (req, res, next) => {
  const eventData = req.body;

  try {
    const cacheKey = `api-v1-events-*`;
    const event = await Event.create(eventData);
    await scanKeys("0", cacheKey);
    return res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

/**
 * @function getEvents
 * @param {HTTP Request} req HTTP Request
 * @param {HTTP Response} res HTTP Response
 * @param {Next Function} next Next function
 * @returns HTTP Response with status 200 with the events on success
 * @returns A call to next() on internal server error
 * @description This function gets all events from the database.
 * It first tries to find all events in the database and update the cache.
 * If the events are found, it returns a success message and the events.
 * If the events are not found, it returns an error message.
 * If an error occurs while trying to find the events, forward the error to the error handlers through the next() function.
 * @todo Implement pagination
 * @todo Implement sorting
 * @todo Implement population
 * @todo Implement aggregation
 * @todo Implement projections
 */
export const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find(req.query).populate();
    const cacheKey = `api-v1-events-${JSON.stringify(req.query)}`;
    if (events.length > 0) {
      await redisClient.set(cacheKey, JSON.stringify(events), {
        EX: 172800,
        NX: true,
      });
      res
        .status(200)
        .json({
          fromCache: false,
          message: "Successful",
          events,
        });
    } else {
      res.status(404).json({ status: 404, message: "No events found" });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @function getEvent
 * @param {HTTP Request} req HTTP Request
 * @param {HTTP Response} res HTTP Response
 * @param {Next Function} next Next function
 * @returns {HTTP Response} HTTP Response with status 200 and the event on success
 * @returns {HTTP Response} HTTP Response with status 404 and error message on invalid request
 * @throws {Error} Throws an error on internal server error
 * @description This function gets an event from the database.
 * It first grabs the id of the event to be fetched from the request parameters.
 * It then tries to find the event in the database. If the event is found, it returns a success message and the event.
 * If the event is not found, it returns an error message.
 * If an error occurs while trying to find the event, it throws an error to be caught by the error handlers.
 * @todo Implement population
 */
export const getEvent = async (req, res, next) => {
  try {
    const cacheKey = `api-v1-events-${req.params.id}`;
    const { id } = req.params;
    const event = await Event.findById(id).exec();
    if (event) {
      
      await redisClient.set(cacheKey, JSON.stringify(event), {
        EX: 172800, // cache expire in 2 days
        NX: true,
      });
      res.status(200).json({
        fromCache: false,
        message: "Successful",
        event,
      });
    } else {
      const errorMessage = {
        message: "Event does not exist",
      };
      res.status(404).json(errorMessage);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @function updateEvent
 * @param {HTTP Request} req HTTP Request
 * @param {HTTP Response} res HTTP Response
 * @returns {HTTP Response} HTTP Response with status 200 and updated event on success,
 * or status 400/500 with error message
 * @description Updates an event and saves it to the database. Emits an event for API call to AI service.
 */
export const updateEvent = async (req, res, next) => {
  const updatedEvent = req.body;
  const id = new ObjectId(req.params.id);
  const cacheKeys = `api-v1-events-*`;
  const cacheKey = `api-v1-events-${req.params.id}`;

  try {
    const { id } = req.params;
    const updatedEvent = req.body;

    const cacheKeys = "api-v1-events";
    const cacheKey = `api-v1-events-${id}`;

    const event = await Event.findByIdAndUpdate(id, { ...updatedEvent });
    await Promise.all([
      redisClient.del(cacheKey),
      scanKeys("0", cacheKeys),
    ]);
    return res.status(200).json({
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @function deleteEvent
 * @param {HTTP Request} req HTTP Request
 * @param {HTTP Response} res HTTP Response
 * @param {Next Function} next Next function
 * @returns HTTP Response with status 200 with the deleted event on success
 * @returns A call to next() on error
 * @description This function deletes an event from the database.
 * It first grabs the id of the event to be deleted from the request parameters.
 * It then tries to delete the event from the database. If the event is successfully deleted,
 * it returns a success message and the deleted event. Call the eventListener.emit() function to
 * trigger an event that makes an API call to the AI service. Also delete the event from cache
 * If deletion fails, it returns an error message.
 */
export const deleteEvent = async (req, res, next) => {
  const id = new ObjectId(req.params.id);
  const cacheKeys = `api-v1-events-*`;
  const cacheKey = `api-v1-events-${req.params.id}`;

  try {
    const deletedData = await Event.findByIdAndDelete(id);
    await Promise.all([
      redisClient.del(cacheKey),
      scanKeys("0", cacheKeys),
      eventListener.emit("deleted", deletedData),
    ]);
    return res.status(200).json({
      message: "Event deleted successfully",
      deletedData,
    });
  } catch (error) {
    next(error);
  }
};

export const joinEvent = (req, res) => {
  // TODO: Implement this function.
  res.send("Join Event");
};
