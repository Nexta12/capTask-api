
import User from "../../models/UserModel.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const CreateUserFormValidator = asyncHandler(async (req, res, next) => {
    const validEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const { email, firstName, lastName } = req.body;

    if (!firstName || firstName === "") {
         res.status(422)
         throw new Error("Provide you first name");
      }
    if (!lastName || lastName === "") {
         res.status(422)
         throw new Error("Provide you first name");
      }
    if (!email || email === "") {
         res.status(422)
         throw new Error("Email is required");
      }

      if (!validEmail.test(email)) {
        res.status(422);
        throw new Error("Email is Invalid");
      }

      const userExists = await User.findOne({email});

      if(userExists){
        const error = new Error("Account Already Exists");
        error.statusCode = 400; 
        throw error; //
      }


      next()
  });