import asyncHandler from "../../utils/asyncHandler.js";

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


