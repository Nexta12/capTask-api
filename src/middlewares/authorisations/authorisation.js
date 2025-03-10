import asyncHandler from "../../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'

export const emailToLowerCase = (req, res, next) => {
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase().trim();
    }
    next();
  };
  
  export const authenticateUser = asyncHandler(async(req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
      } else {
        res.status(403)
        throw new Error("You are not Logged In");
      }
      
  })

  export const ensureGuest = asyncHandler(async(req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
      } else {
        res.status(403)
        throw new Error("You Already Logged In");
      }

  });
  export const generateAccessToken = (user, jwt) => {
    return jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "3h" },
    );

  };

  export const allowedRoles = (roles) =>{
    return (req, res, next) =>{
      if (roles.includes(req.user.role)) {
        next();
      } else {
        const error = new Error("Unauthorized Action");
        error.statusCode = 403; 
        throw error; //
      }
    }
  };
  export const checkJwt = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .send({ message: "Authorization header not provided" });

    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Ensure this matches your token secret
      req.jwtPayload = payload; // Add user info from the token
      next(); // Proceed if token is valid
    } catch (err) {
      return res.status(401).send({ message: "Unauthorized: Invalid token" });
    }
  }

