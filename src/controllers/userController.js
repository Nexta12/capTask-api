import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from 'bcryptjs'
import { responseHandler } from "../utils/responseHandler.js";
import User from '../models/UserModel.js'
import { ROLES } from "../constants/UserRoles.js";
import { sendUserPassword } from "../services/emailCalls.js";

   /**
 * @desc    Create a user
 * @route   POSTT /api/users/:id
 * @access  Private (SUPER ADMIN, ADMIN and MANAGER Roles)
 */
export const createUser  = asyncHandler(async(req, res, next ) => {
    const defaultPassword = process.env.DEFAULT_PASSWORD;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)
    const user = await User.create({...req.body, password: hashedPassword});
    if(!user) throw new Error('Error Creating User')
    const { password, updatedAt , ...newUser } = user._doc
    await sendUserPassword(user)
    responseHandler(res, 201, newUser, 'New User created successfully' )
  });

   /**
 * @desc    Update a user
 * @route   PUT /api/users/:id
 * @access  Private (Admin or the user themselves)
 */
export const updateUser  = asyncHandler(async(req, res, next ) => {
    const { id } = req.params;

   // Hash the password if it's being updated
   if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 10);
  }

    // Prevent employees from updating roles
  if (req.body.role && req.user.role === ROLES.EMPLOYEE) {
    const error = new Error("Unauthorized Action: Employees cannot update roles.");
    error.statusCode = 403; // Forbidden
    throw error;
  }
    
   // Update the user
   const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true } // Return the updated document and run schema validators
  );

  if (!updatedUser) {
    const error = new Error("User not found.");
    error.statusCode = 404; // Not Found
    throw error;
  }

    responseHandler(res, 201, updatedUser, ' User updated successfully' )
  })

   /**
 * @desc    Delete a user
 * @route   Delete /api/users/delete/:id
 * @access  Private (Admin)
 */
export const deleteUser = asyncHandler(async(req, res, next ) => {
    const { id } = req.params;
    

    // Prevent employees from updating roles
  if ( req.user.role === ROLES.EMPLOYEE) {
    const error = new Error("Unauthorized Action.");
    error.statusCode = 403; // Forbidden
    throw error;
  }
    
   // Update the user
   const deletedUser = await User.findByIdAndDelete(id);

   if(!deletedUser) {
    const error = new Error("User not found");
    error.statusCode = 404; // Forbidden
    throw error;
   }

    responseHandler(res, 200, null, ' User deleted successfully' )
  })
  