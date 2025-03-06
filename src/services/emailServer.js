import { config } from "dotenv";
config({ path: "./config/.env" });
import nodemailer from "nodemailer";


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
transporter.verify((error, success) => {

  if (error) {
    console.log(error)
  } else {
    logger.info("Server is ready to send emails!", success);
  }
});

export default transporter;

