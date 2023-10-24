 /**
 * @module models/opt
 * @requires mongoose
 * @exports OTP
 * @description This module contains the mongoose model for opt.
 */

 import mongoose from "mongoose";

 const otpSchema = new mongoose.Schema({
    otp: {
        type: String,
        minLength: [6, "OTP must be at least 6 characters long"],
        required: [true, "OTP is required"],
        index: true,
    },
    username: {
        type: String,
        required: [true, "username is required"],
        index: true,
    },
    status: {
        type: String,
        required: [true, "status is required"],
        index: true,
        enum: ["AWAITING_OTP_VERIFICATION", "ACTIVE", "INACTIVE"],
    },
    expireIn: {},
 },
   { autoIndex: false }
 );
 
 const OTP = mongoose.model("OTP", otpSchema);
 
 export default OTP;