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
    createTicket,
    processPayment, 
    updateInventory,
    scanTicket
} from "../controllers/tickets.js";

const paymentRoutes = Router();

paymentRoutes.post("/tickets", processPayment);
paymentRoutes.put("/inventory", updateInventory);
paymentRoutes.post("/generate-ticket", createTicket);
paymentRoutes.post("/scan-ticket", scanTicket);

export default paymentRoutes;