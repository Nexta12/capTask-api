import { config } from "dotenv";
config({ path: "./config/.env" });
import nodemailer from "nodemailer";
import { checkInternetConnection } from "../utils/internetAccess.js";


// Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,  
  port: process.env.EMAIL_PORT, 
  secure: true,  
  auth: {
    user: process.env.USER_EMAIL,  
    pass: process.env.EMAIL_PASS, 
  },
  tls: {
    rejectUnauthorized: false,  
  },
});


//Verify the connection configuration
transporter.verify(async (error, success) => {
  const isOnline = await checkInternetConnection();
  if (!isOnline) {
    return logger.info("No Internet Access");
  }
  if (error) {
    if (error.message.includes("Invalid login")) {
      logger.error("Gmail SMTP Login Refused");
    } else {
      console.log(error.message);
    }
  } else {
    logger.info("Server is ready to send emails!", success);
  }
});
export default transporter;

