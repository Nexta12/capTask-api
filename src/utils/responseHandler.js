
export const responseHandler = (res, statusCode,  data = null, message, success = true) => {
    const response = {
      success,
      statusCode,
      data,
      message,
    };
  
    // Include stack trace in development mode for errors
    if (!success && process.env.NODE_ENV === "development") {
      response.stack = data?.stack || null;
    }
  
    return res.status(statusCode).json(response);
  };