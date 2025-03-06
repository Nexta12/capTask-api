import { Router } from "express";
import cron from 'node-cron'
import { sendDailyReportEmail } from "./emailCalls.js";

const router = Router();

const sendDownLoadLink = async () => {
    try {
      console.log("Sending download link...");
      sendDailyReportEmail()
    } catch (error) {
      console.error("Error sending download link:", error);
    }
  };
  
  // Schedule the cron job to run at 6:00 PM every weekday (Monday to Friday)

  cron.schedule("0 18 * * 1-5", sendDownLoadLink, {
    timezone: "Africa/Lagos", 
  });
  
  // console.log("Employee Report Email Scheduled  for 6:00 PM every weekday (Monday to Friday) in GMT+1 (West Africa).");


export default router;