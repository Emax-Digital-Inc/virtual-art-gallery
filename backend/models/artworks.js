 /**
 * @module models/artWorks
 * @requires mongoose
 * @exports ArtWork
 * @description This module contains the mongoose model for ArtWork.
 */

 import mongoose from "mongoose";

 const ArtWorkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "title is required"],
        index: true,
    },
    artists: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Artists,
        required: [true, "Artist is required"],
    },
    arts: {
      type: Buffer
    }
 },
   { autoIndex: false }
 );
 
 const ArtWork = mongoose.model("ArtWork", otpSchema);
 
 export default ArtWork;