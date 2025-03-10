import { responseHandler } from "../utils/responseHandler.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  // Log the error for debugging
   logger.error(err.message);

  // Send standardized error response
  return responseHandler(res, statusCode, null, message,  false);
};

export default errorHandler;
