import dotenv from "dotenv";
import * as QRCode from "qrcode";
import { xml2js } from "xml-js"
import Jimp from "jimp";
import qrCodeReader from "qrcode-reader";

import Payment from "../models/payments.js";
import Ticket from "../models/tickets.js";

dotenv.config();

// TODO: Generate QRCode for ticket once payment has been successfull
export const processPayment = async (req, res, next) => {
  const transDetails = req.body;

  //will move validation to a middleware
  if ( 
    !req.body.clientId || 
    !req.body.clientSecret || 
    !req.body.phone || 
    !req.body.destinationAccount || 
    !req.body.amount || 
    !req.body.productUids ||
    !req.body.hash || 
    !req.body.responseUrl
    ) {
    return response("Please fill in all required fields", req, res);
 }

 //Generating the Hash
 let concat = req.body.clientId + req.body.encryptionKey + req.body.phone + req.body.amount;
 let hex = await digestMessage(concat);
 
 async function digestMessage(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
 }

  try {
    const eventId = req.params.eventId;
    const userId = req.params.userId;
    const ticketQuantity = req.params.quantity
    const event = await Event.findById(eventId).exec;
    if (!event) {
        return res.status(404).json({
            message: "No such event found"
        });
    }
    //should be checking quantity of tickets left
    if (event.capacity === 0) {
        return res.status.json({
            message: "Tickets for the event had been sold out"
        });
    }
    let sso = new StewardBankSSO(); // 1.
    const totalAmount = amount * ticketQuantity;
    const paymentResponse = await sso.payment({ // 2.
        clientId: req.body.clientId, 
        clientSecret: req.body.clientSecret, 
        destinationAccount: req.body.destinationAccount, //if required by client configuration
        amount: totalAmount,
        phone: req.body.phone,
        productUids: req.body.productUids,
        hash: hashHex,
        responseUrl: req.body.responseUrl,
        sandbox: true
    });
    
    //also need to add eventId and userId on create transaction
    const transaction = await Payment.create(paymentResponse);
    if (!paymentResponse) {
        return res.status(400).json({
            message: "Payment failed",
            paymentResponse,
          });
    }
    if (!transaction) {
        return res.status(400).json({
            message: "Failed to save the transaction",
            transaction,
          });
    }


    // Update the ticket inventory within a transaction
    const deductTicketQuanity = event.quantity - ticketQuantity;
    const updateResult = Event.findByIdAndUpdate(eventId, {capacity: deductTicketQuanity});
    if (updateResult !== 'success') {
        return res.status(500).json({ 
            message: 'Inventory update failed',
            updateResult,
        });
    }

    
    return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve('success');
        }, 1000);
      });
  } catch (error) {
    next(error);
  }
};

// controller for updating inventory route
export const updateInventory = async (req, res, next) => {
    // Get the updated inventory details from the request body
    const inventoryUpdateData = req.body;
    const ticketId = req.params.ticketId;
  
    // proper validation
    if (!ticketId || !quantity) {
      return res.status(400).json({
        message: 'Invalid input' 
      });
    }
    try {
        // Update the inventory within a transaction
        const updateResult = Event.findByIdAndUpdate(ticketId, {...inventoryUpdateData});
        // Check if the inventory update was successful
        if (updateResult !== 'success') {
            return res.status(500).json({
                message: 'Inventory update failed',
            });
        }
        // Return a response indicating success
        return res.status(200).json({
            message: 'Inventory updated successfully',
            updateResult
        });
    } catch (error) {
        next(error);
    }

  }
  
    
export const createTicket = async (req, res, next) => {
    const ticket = {
      user: req.body.user,
      amount: req.body.amount,
      event: req.body.event,
      date: new Date().getHours
    };

    // Generating a QR code as an SVG string, attaching the SVG string to the ticket and storing the ticket object in the database
    QRCode.toString(JSON.stringify(ticket), { type: 'svg' }, async function (err, svgString) {
      if (err) throw err;
    
      ticket.qrCode = svgString;
      const newTicket = ticket;

      const createticket = await Ticket.create(newTicket);
      if (!createticket) {
        res.status(400).json({
          message: "Failed to create ticket",
        });
      }
      return  res.status(200).json({
        message: "Ticket successfully created",
        createticket
      });
      });              
  }


export const scanTicket =  async (req, res, next) => {

    const reqScannedTicket =req.body.qrCode;

    try {
      const savedTicket = await Ticket.findOne({
        user: req.body.user, event: req.body.event
    });
    console.log("savedTicket{}{}{}: ", savedTicket)
    if (!savedTicket) {
        return  res.status(400).json({
            message: "Ticket does not exist in the database",
        });
    }
    if (savedTicket.scanned == true) {
      return res.status(400).json({
        message: "Sorry! Your Ticket was used",
        savedTicket
      });
    }
    console.log("before decode savedTicket: ", savedTicket.qrCode);
    if (reqScannedTicket === savedTicket.qrCode) {
      await savedTicket.updateOne({ scanned: true });
      return  res.status(200).json({
          message: "Ticket Matched successfully",
          savedTicket
      });
    } else {
        return  res.status(404).json({ 
        message: "Ticket does not match",
        });
    }
    } catch (error) {
      next(error);
    }
} 