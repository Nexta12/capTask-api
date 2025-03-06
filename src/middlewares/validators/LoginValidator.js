
import asyncHandler from "../../utils/asyncHandler.js";

export const LoginFormValidator = asyncHandler(async (req, res, next) => {
    const validEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const { email, password } = req.body;

    if (!email || email === "") {
         res.status(422)
         throw new Error("Email is required");
      }

      if (!validEmail.test(email)) {
        res.status(422);
        throw new Error("Email is Invalid");
      }

      if(!password || password === ""){
        res.status(422)
        throw new Error("Password is required");
      }
      next()
  });