
import asyncHandler from "../../utils/asyncHandler.js";

export const TaskFormValidator = asyncHandler(async (req, res, next) => {

    const { title, description, hoursWorked, creationDate } = req.body;

    if (!title || title === "") {
         const error = new Error("Task Title is required");
         error.statusCode = 400; 
         throw error;
      }
      if (!hoursWorked || hoursWorked === "") {
        const error = new Error("Total Hours worked is required");
        error.statusCode = 400; 
        throw error;
        }
    if (!description || description === "") {
      const error = new Error("Task description is required");
      error.statusCode = 400; 
      throw error;
      }
 

      if (creationDate) {
         const date = new Date(creationDate);
         // Check if the date is valid
         if (isNaN(date.getTime())) {
            const error = new Error("Provide Valid date");
            error.statusCode = 400; 
            throw error;
         }
       }

      next()
  });