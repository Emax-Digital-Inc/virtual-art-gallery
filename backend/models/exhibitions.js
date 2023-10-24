/**
 * @module models/events
 * @requires mongoose
 * @requires models/sessions
 * @requires models/tickets
 * @requires models/venues
 * @requires models/organizers
 * @requires models/categories
 * @requires models/sponsors
 * @exports Exhibitions
 * @description This module contains the mongoose model for events.
 */

import mongoose from "mongoose";

const exhibitionsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      minLength: [5, "Title must be at least 5 characters long"],
      required: [true, "Title is required"],
      unique: true,
      index: true,
    },
    description: {
      type: String,
      minLength: [10, "Description must be at least 10 characters long"],
      required: [true, "Description is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      index: true,
    },
    endDate: {
      type: Date,
      index: true,
    },
    imageUrls: {
      type: [String],
    },
    tickets: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Ticket",
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      index: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Organizer is required"],
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    sponsors: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      index: true,
    },
    status: {
      type: String,
      enum: ["isPublished", "isDraft", "isCancelled"],
      default: "isDraft",
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  {timestamps: true }, { autoIndex: false }
);

const Exhibitions = mongoose.model("Exhibitions", exhibitionsSchema);

export default Exhibitions;
