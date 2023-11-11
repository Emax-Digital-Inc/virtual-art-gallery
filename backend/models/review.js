/**  @module models/review
 * @requires mongoose
 * @requires models/review
 * @exports review
 * @description This module contains the mongoose model for review
 */

import mongoose from "mongoose";

const eventReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "user is required"],
    index: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exhibitions",
    required: true,
    index: true
  },
  artWork: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ArtWork,
    required: [true, "art work is required"],
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model('Review', eventReviewSchema);

export default Review;