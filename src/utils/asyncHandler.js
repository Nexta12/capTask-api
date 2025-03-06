 import {responseHandler} from '../utils/responseHandler.js'

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(error=>{
      logger.error(error.message);
      // Send Standard Response
      responseHandler(res, error.statusCode || 500, null, error.message || "Internal Server Error", false )
    });
  };
  
  export default asyncHandler;
  