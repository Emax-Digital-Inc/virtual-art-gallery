/**
 * @module controllers/auth
 * @requires bcryptjs
 * @requires jsonwebtoken
 * @requires dotenv
 * @requires ../models/users
 * @requires ../utils/mailing
 * @requires ../utils/index
 * @description Defines functions for handling various auth handlers.
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/users.js";
import { sendingMail } from "../utils/mailing.js";
import { generateTokens } from "../utils/index.js";

import OTP from "../models/otp.js"; 
import UserDemographics from "../models/userDemographics.js";

dotenv.config();

/**
 * Register a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the registration is successful.
 */
export const register = async (req, res, next) => {
  try {
    const user = req.body;
    if (
      !user.email || 
      !user.password ||
      !user.phone ||
      !user.gender ||
      !user.location ||
      !user.dateOfBirth ||
      !user.locationLat ||
      !user.locationLon ||
      !user.role) {
      return res
        .status(400)
        .json({ message: "Fill in all required fields!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;

    const newUser = await User.create(user);
    if (!newUser) {
      return res.status(400).json({
        message: "failed to create",
      });
    }
    const userDemographic = await UserDemographics.create({ 
      user: newUser._id,
      location: newUser.location,
      browser: req.useragent.browser,
      os: req.useragent.os,
      device: req.useragent.isMobile
        ? "Mobile"
        : req.useragent.isDesktop
        ? "Desktop"
        : "Bot",
    });
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id, role: newUser.role, },
      process.env.ACTIVATION_SECRET,
      { expiresIn: "20m" }
    );

    const link = `${process.env.CLIENT_URL}/auth/verify-email/${token}`;

    await sendingMail({
      from: process.env.MAIL_USERNAME,
      to: newUser.email,
      subject: "Verify your email",
      text: `Hello ${newUser.firstName},\nPlease click on the link to activate your account.\n${link}`,
    });

    eventListener.emit("userRegistered", newUser);
    res.status(201).json({
      message: "success",
      newUser});
  } catch (error) {
    next(error);
  }
};

/**
 * Login a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware.
 * @return {Promise<void>} - A promise that resolves when the login is successful.
 * @throws {Error} - Throws an error if the login is unsuccessful.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: "User doesn't exist!" });
    }

    const isPasswordCorrect = bcrypt.compare(password, existingUser.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    if (!existingUser.isVerified) {
      return res.status(400).json({ message: "Please activate your account!" });
    }

    const { accessToken, refreshToken } = generateTokens(existingUser);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({ result: existingUser, token: accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {Error} - Throws an error if the logout is unsuccessful.
 */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = res.cookies;

    if (!refreshToken) {
      throw new Error("Please login first!");
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: true,
      sameSite: "none",
    });

    await User.findByIdAndUpdate(req.id, { refreshToken: "" });

    res.status(200).json({ message: "Logout successful!" });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware.
 * @return {Promise<void>} - A promise that resolves when the forgot password is successful.
 * @throws {Error} - Throws an error if the forgot password is unsuccessful.
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: "User doesn't exist!" });
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.FORGOT_PASSWORD_SECRET,
      { expiresIn: "10m" }
    );
    const link = `${process.env.CLIENT_URL}/auth/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: existingUser.email,
      subject: "Reset Password Link",
      text: `Hello ${existingUser.name},\nPlease click on the link to reset your password.\n${link}`,
    };

    await sendingMail(mailOptions);
    res.status(200).json({ message: "Reset password link sent!" });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware.
 * @return {Promise<void>} - A promise that resolves when the reset password is successful.
 * @throws {Error} - Throws an error if the reset password is unsuccessful.
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Invalid token!" });
    }

    const decoded = jwt.verify(token, process.env.FORGOT_PASSWORD_SECRET);
    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      { password },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ message: "User doesn't exist!" });
    }

    await sendingMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset Successfully",
      text: `Hello ${user.name},\nYour password has been reset successfully.`,
    });

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the email is verified.
 * @throws {Error} - Throws an error if the email is not verified.
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.ACTIVATION_SECRET);
    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      res.status(400).json({ message: "User doesn't exist!" });
      return;
    }

    await sendingMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Email Verified Successfully",
      text: `Hello ${user.name},\nYour email has been verified successfully.`,
    });

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    next(error);
  }
};

// /**
//  * Send otp.
//  * @param {Object} req - The request object.
//  * @param {Object} res - The response object.
//  * @param {Function} next - The next middleware function.
//  * @returns {Promise<void>} - A promise that resolves when the otp is sent.
//  * @throws {Error} - Throws an error if the otp is not send.
//  */

// export const sendOTP = async (username, mobile, name) => {
//   const courier = CourierClient({
//     authorizationToken: process.env.COURIER_TOKEN,
//   });

//   try {
//       const otp = otpGenerator.generate(6, {
//           upperCaseAlphabets: false,
//           specialChars: false,
//       });
//       await addNewOTP(otp, 15, username, "AWAITING_OTP_VERIFICATION");
//       await sendVerificationMessage(
//           {
//             username,
//             otp,
//           },
//           phone
//       );
//       return {
//           success: true,
//           message: "OTP sent successfully",
//       };
//   } catch (error) {
//       console.error(error);
//       throw error;
//   }
// };

// export const reSendOTP = async (username, phone, name) => {
//   try {
//       await rejectPendingOTP(username);
//       return await sendOTP(username, phone, name);
//   } catch (error) {
//       console.error(error);
//       throw error;
//   }
// };

// export const verifyOTP = async (username, otp) => {
//   try {
//     const validOTP = await OTP.findOne({
//       otp,
//       username,
//       status: "AWAITING_OTP_VERIFICATION",
//       expireIn: { $gte: new Date().getTime() },
//     });
//     if (validOTP) {
//       await OTP.updateOne(
//         { _id: validOTP._id },
//         { $set: { status: "ACTIVE" } }
//       );
//       await UserModel.updateOne({ username }, { $set: { status: "ACTIVE" } });
//       return {
//         success: true,
//         message: "User verified",
//       };
//     }
//     throw new Error("Invalid OTP");
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };

// export const sendVerificationMessage = (params, mobileNumber) => {
//   return courier.send({
//     message: {
//       to: {
//         data: params,
//         phone_number: mobileNumber,
//       },
//       content: {
//         title: "XYZ Verification",
//         body: "Hi {{name}},\nYour verification code for XYZ is {{otp}}.",
//       },
//       routing: {
//         method: "single",
//         channels: ["sms"],
//       },
//     },
//   });
// };