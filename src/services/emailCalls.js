import asyncHandler from "../utils/asyncHandler.js";
import { SendDailyTaskReport, SendPasswordToUser } from "./emailTemplate.js";
import transporter from "../services/emailServer.js"

export const sendDailyReportEmail = asyncHandler(async(req, res, next)=>{
  const today = new Date();
    const mailOptions = {
        from: `"CapTask" <${process.env.USER_EMAIL}>`,
        to: process.env.departmentHeadEmail,
        subject: `Employees Daily Task Report - ${today.toLocaleDateString("en-GB", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        html: SendDailyTaskReport(),
        headers: {
          "List-Unsubscribe":
            "<https://captask.com/unsubscribe>, <mailto:unsubscribe@captask.com>",
        },
      };

      await transporter.sendMail(mailOptions);
      logger.info('Daily Report Sent to Department head')

})

export const sendUserPassword = async(user)=>{
    const mailOptions = {
        from: `"CapTask" <${process.env.USER_EMAIL}>`,
        to: user.email,
        subject: `Login Credentials`,
        html: SendPasswordToUser(user),
        headers: {
          "List-Unsubscribe":
            "<https://captask.com/unsubscribe>, <mailto:unsubscribe@captask.com>",
        },
      };

      await transporter.sendMail(mailOptions);
      logger.info('Password Sent to registered user')

}