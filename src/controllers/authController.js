import { generateAccessToken } from "../middlewares/authorisations/authorisation.js";
import asyncHandler from "../utils/asyncHandler.js";
import {responseHandler}  from "../utils/responseHandler.js";
import passport from 'passport'
import jwt from 'jsonwebtoken'


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
})
