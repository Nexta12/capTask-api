import mongoose from 'mongoose';
import { ROLE_VALUES, ROLES, TITLES, TITLES_VALUES } from '../constants/UserRoles.js';

const userSchema = new mongoose.Schema({
  title: {type: String, enum: TITLES_VALUES, default: TITLES.MR},
  firstName: {type: String, required: true, trim: true},
  lastName: {type: String, required: true, trim: true},
  email: {type: String, required: true, trim: true, lowercase: true, unique: true, select: false},
  password: {type: String, min: 6 },
  portfolio: {type: String},
  lastLogin: Date,
  description: { type: String, lowercase: true },
  department: { type: String, lowercase: true },
  role: {type: String, enum: ROLE_VALUES, default: ROLES.EMPLOYEE},
  isSuperAdmin: {type: Boolean, default: false}

},{timestamps: true})

const User = mongoose.model("User", userSchema);
export default User;