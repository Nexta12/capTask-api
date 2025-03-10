
import { ForgotPasswordTemplate, SendDailyTaskReport, SendPasswordToUser } from "./emailTemplate.js";
import transporter from "../services/emailServer.js"

export const sendDailyReportEmail = async(user)=>{
  const today = new Date();
    const mailOptions = {
        from: `"CapTask" <${process.env.USER_EMAIL}>`,
        to: user.email,
        subject: `Employees Daily Task Report - ${today.toLocaleDateString("en-GB", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        html: SendDailyTaskReport(user),
        headers: {
          "List-Unsubscribe":
            "<https://captask.com/unsubscribe>, <mailto:unsubscribe@captask.com>",
        },
      };

      await transporter.sendMail(mailOptions);
      logger.info('Daily Report Sent to Department head')

}

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

    };

    export const ForgotPasswordEmail = async (otp, email) => {
      try {
  
        const mailOptions = {
          from: `"CapTask" <${process.env.USER_EMAIL}>`,
          to: email,
          subject: "Password Reset OTP",
          html: ForgotPasswordTemplate(otp),
          headers: {
            "List-Unsubscribe":
              "<https://captask.com/unsubscribe>, <mailto:unsubscribe@captask.com>",
          },
        };
  
        await transporter.sendMail(mailOptions);
        logger.info('OTP Sent to registered user')
      } catch (err) {
        console.log(err)
      }
    }