import mongoose from 'mongoose';
import { ROLE_VALUES, ROLES, TITLES, TITLES_VALUES } from '../constants/UserRoles.js';

const userSchema = new mongoose.Schema({
  title: {type: String, enum: TITLES_VALUES, default: TITLES.MR},
  firstName: {type: String, required: true, trim: true},
  lastName: {type: String, required: true, trim: true},
  email: {type: String, required: true, trim: true, lowercase: true, unique: true, },
  password: {type: String, min: 6 },
  description: { type: String, lowercase: true },
  phone: { type: String},
  department: { type: String, lowercase: true },
  position: { type: String, enum: ['Department Head', 'None'], default: 'None' },
  address: { type: String},
  role: {type: String, enum: ROLE_VALUES, default: ROLES.EMPLOYEE},
  isSuperAdmin: {type: Boolean, default: false}

},{timestamps: true})

const User = mongoose.model("User", userSchema);
export default User;