import User from "../models/UserModel.js";
import asyncHandler from "./asyncHandler.js";
import bcrypt from "bcryptjs";

const InitializeSuperAdmin = asyncHandler(async(req, resizeBy, next ) => {

     // Check if the super admin already exists
     const superAdminExists = await User.findOne({ email: process.env.SUPER_USER_EMAIL });
     if (superAdminExists) {
        logger.warn('Super Admin already exists.');
        return;
      }

       // Hash the super admin password
    const hashedPassword = await bcrypt.hash(process.env.SUPER_USER_PASSWORD, 10);

     // Create the super admin
     const superAdmin = new User({
        email: process.env.SUPER_USER_EMAIL,
        password: hashedPassword,
        firstName: process.env.SUPER_USER_FIRST_NAME,
        lastName: process.env.SUPER_USER_LAST_NAME,
        role: process.env.SUPER_USER_ROLE,
        isSuperAdmin: true, 
      });
  
     const newSuperAdmin =  await superAdmin.save();
     if(!newSuperAdmin){
        throw new Error('Super Admin failed to Create')
     }
    logger.info('Super Admin created successfully.');
})

export default InitializeSuperAdmin;