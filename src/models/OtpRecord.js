
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    otp: String,
    email: String,
    expiresIn: Date,
    isVerified: {type: Boolean, default: false}
  },
  { timestamps: true }
);

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
