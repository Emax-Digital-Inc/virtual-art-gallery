/**
 * @module models/payments
 * @requires mongoose
 * @requires models/events
 * @requires models/users
 * @exports Payment
 * @description This module contains the mongoose model for payments.
 */

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: [true, "Event is required"],
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
    index: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    index: true,
  },
  phone: {
    type: Number,
    required: [true, "Number is required"],
    index: true,
  },
  currency: {
    type: String,
    enum: ["ZWL", "USD"],
    required: [true, "Currency is required"],
    index: true,
  },
  status: {
    type: String,
    enum: ["SUCCESS", "PENDING", "FAILED"],
    default: "PENDING",
  },
  transactionReference: {
    type: String,
    index: true,
  },
  transactionId: {
    type: String,
    index: true,
  },
  transactionDate: {
    type: Date,
    index: true,
  },
  modificationDate: {
    type: Date,
    index: true,
  },
}, { autoIndex: false });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;