 /**
 * @module models/artists
 * @requires mongoose
 * @exports Artists
 * @description This module contains the mongoose model for Artists.
 */

 import mongoose from "mongoose";

 const ArtistsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
        index: true,
    },
 },
   { autoIndex: false }
 );
 
 const Artists = mongoose.model("Artists", otpSchema);
 
 export default Artists;