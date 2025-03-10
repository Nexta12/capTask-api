export const generateOTP = () => {
    const otpNo = Math.floor(100000 + Math.random() * 9000);
    return otpNo.toString();
  };
    