/**  @module models/ratings
 * @requires mongoose
 * @requires models/ratings
 * @exports Ratings
 * @description This module contains the mongoose model for ratings
 */

import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exhibitions",
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  points: {
    type: Number,
  },
  comment: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Ratings = mongoose.model('Ratings', ratingSchema);

export default Ratings;