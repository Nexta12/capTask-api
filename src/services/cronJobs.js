import { Router } from "express";
import cron from "node-cron";
import { sendDailyReportEmail } from "./emailCalls.js";
import User from "../models/UserModel.js";


const router = Router();

const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "0 18 * * 1-5"; // Default: 6:00 PM Mon-Fri

const TIMEZONE = process.env.TIMEZONE || "Africa/Lagos";

let lastRunStatus = {
  lastRun: null,
  success: false,
  error: null,
};

const sendDownLoadLink = async () => {
  try {
    const departmentHeads = await User.find(
      { position: "Department Head" },
      { email: 1, firstName: 1, lastName: 1, department: 1 }
    );
    console.log("Sending download link to department heads...");

    await Promise.all(
      departmentHeads.map(async (user) => {
        try {
          await sendDailyReportEmail(user);
          console.log(`Email sent successfully to ${user.email}`);
        } catch (error) {
          console.log(`Failed to send email to ${user.email}:`, error);
          throw error; // Propagate the error
        }
      })
    );

    lastRunStatus = {
      lastRun: new Date(),
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("Error sending download link:", error);
    lastRunStatus = {
      lastRun: new Date(),
      success: false,
      error: error.message,
    };
  }
};

// Schedule the cron job
cron.schedule(CRON_SCHEDULE, sendDownLoadLink, {
  timezone: TIMEZONE,
});

console.log(
  `Employee Report Email Scheduled for ${CRON_SCHEDULE} in ${TIMEZONE}.`
);

export default router;