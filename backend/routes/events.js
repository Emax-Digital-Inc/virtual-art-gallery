/**
 * @module routes/events
 * @requires express
 * @requires controllers/events
 * @requires middlewares/event
 * @exports eventsRoutes
 * @description This module contains the routes definitions for events.
 */

import { Router } from "express";
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
} from "../controllers/events.js";

import {
  createDataValidator,
  deleteDataValidator,
  getEventErrorHandler,
  updateDataValidator,
} from "../middlewares/event.js";
import { 
  getEventCacheData, 
  getEventsCacheData 
} from "../middlewares/eventCache.js";
import { authenticateKey } from "../middlewares/apiAuth.js";
import { roleAuth } from "../middlewares/auth.js";

const eventsRoutes = Router();

eventsRoutes.get("/events", getEventsCacheData, getEvents);
eventsRoutes.post("/events", createDataValidator, createEvent);
eventsRoutes.patch("/events/:id", updateDataValidator, updateEvent);
eventsRoutes.delete("/events/:id", deleteDataValidator, deleteEvent);
eventsRoutes.get("/events/:id", getEventErrorHandler, getEventCacheData, getEvent);
eventsRoutes.patch("/events/:id/join", joinEvent);

export default eventsRoutes;
