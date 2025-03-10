import { generateAccessToken } from "../middlewares/authorisations/authorisation.js";
import asyncHandler from "../utils/asyncHandler.js";
import {responseHandler}  from "../utils/responseHandler.js";
import passport from 'passport'
import jwt from 'jsonwebtoken'
import User from '../models/UserModel.js'
import OTP from "../models/OtpRecord.js";
import bcrypt from 'bcryptjs'
import { ForgotPasswordEmail } from "../services/emailCalls.js";
import { generateOTP } from "../services/helpers.js";


export const Login =  asyncHandler(async (req, res, next) => {

   
  passport.authenticate("local", { session: true }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      const error = new Error(info.message);
          error.statusCode = 404; 
          throw error; 
    }

    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      } else {
        // Generate and Send Access Tokens to client:
        const accessToken = generateAccessToken(user, jwt);
        const { password, createdAt, updatedAt, ...payload } = user._doc;
        return res.status(200).json({
          message: "Login successfully",
          accessToken,
          data: payload,
        });
      }
    });
  })(req, res, next);
  });

export const Logout = asyncHandler(async(req, res, next ) => {

  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(); // Clean up the session from Database
    responseHandler(res, 200, null, 'Logged Out' )
  });
});

export const ValidateAuth = async (req, res) => {
  try {
    const currentUser = req.user;

    const userDetails = {
      id: currentUser._id,
      role: currentUser.role,
      email: currentUser.email,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
    };

    res.status(200).json({ data: userDetails });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
}

export const ForgotPassword = asyncHandler(async (req, res) => {
  let { email } = req.body;

    email = email?.trim().toLowerCase();

    // Validate inputs
    if (!email || email === "") {
      const error = new Error("Provide your email");
      error.statusCode = 403; // Internal Server Error
      throw error;
    }

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      const error = new Error("Email is invalid");
      error.statusCode = 403; // Internal Server Error
      throw error;
    }

    // Check if email exists
    const userEmailExists = await User.findOne({ email });

    if (!userEmailExists) {
      const error = new Error("Invalid Credential");
      error.statusCode = 403; // Internal Server Error
      throw error;
    }

    // Generate OTP
    const otpData = generateOTP();

    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(otpData, salt);

    // Set expiration time to 15 minutes from now
    const expiresIn = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store the hashed OTP and expiration time in the database
    const storedOtp = await OTP.create({ otp: hashedOTP, email, expiresIn });
    // Send the OTP to the user's email
     await ForgotPasswordEmail(otpData, email);

     // Send success response
    responseHandler(res, 201, storedOtp, "successful.");
});

export const ResetPassword = asyncHandler( async (req, res) => {
  let { password, confirmPassword, email } = req.body;

    email = email?.trim().toLowerCase();

    // Validate inputs
    if (!email || email === "") {
      const error = new Error("Email Data Missing");
      error.statusCode = 403; // Internal Server Error
      throw error;
    }
    if (!password || password === "") {
      const error = new Error("password Data Missing");
      error.statusCode = 403; // Internal Server Error
      throw error;
    }
    if (password !== confirmPassword) {
      const error = new Error("passwords do not match");
      error.statusCode = 403; // Internal Server Error
      throw error;
    }

    // Check if email exists
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error("User don't exist");
      error.statusCode = 404; // Internal Server Error
      throw error;

    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save()

    // Delete the userOTP record

    await OTP.findOneAndDelete({email})

    responseHandler(res, 200, null, "Password updated");
})

export const VerifyOtp =  asyncHandler(async (req, res) => {
  const { email, otp } = req.body;


    if(!otp || otp === ''){
      const error = new Error("Provide the otp sent to you email");
      error.statusCode = 404; 
      throw error;
    }

    const otpRecord = await OTP.findOne({ email });


    if (!otpRecord) {
      const error = new Error("OTP not found");
      error.statusCode = 404; 
      throw error;
    }

    if (new Date() > otpRecord.expiresIn) {
      const error = new Error("OTP has expired");
      error.statusCode = 400; 
      throw error;
    
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otp);

    if (!isValid) {
      const error = new Error("Invalid OTP");
      error.statusCode = 400; 
      throw error;
    }

    otpRecord.isVerified = true;
    otpRecord.save();
    responseHandler(res, 200, null, "OTP verified successfully");
})