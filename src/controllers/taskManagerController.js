import asyncHandler from "../utils/asyncHandler.js";
import Task from "../models/TaskManager.js";
import User from "../models/UserModel.js";
import { responseHandler } from "../utils/responseHandler.js";
import { ROLES } from "../constants/UserRoles.js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import ExcelJS from "exceljs";

/**
 * @desc    Submit A task
 * @route   POST /api/task/create
 * @access  Private (Employees)
 */
export const submitTask = asyncHandler(async (req, res, next) => {
  const newTask = await Task.create({ ...req.body, employee: req.user.id });

  if (!newTask) {
    const error = new Error("Error creating a task");
    error.statusCode = 404;
    throw error;
  }

  responseHandler(res, 201, newTask, " Task Created awaiting Approval");
});

export const getSingleTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the task by ID
  const task = await Task.findById(id).populate([
    { path: "employee", select: "firstName lastName" },
    { path: "remarkBy", select: "firstName lastName" }
  ]);

  if (!task) {
    const error = new Error("Task not found.");
    error.statusCode = 404;
    throw error;
  }
  // Send success response
  responseHandler(res, 200, task, "Task deleted successfully.");
});

export const getAllTasks = asyncHandler(async (req, res) => {
  const { department, employeeName, startDate, endDate, status, page = 1, pageSize = 10, userId } = req.query;

  let filter = {}; // Stores query filters

  if (userId) {
    filter.employee = userId; 
  }

  // Filter by department if provided
  if (department) {
    const employeesInDepartment = await User.find({ department }, { _id: 1 });
    const employeeIds = employeesInDepartment.map((emp) => emp._id);
    filter.employee = { $in: employeeIds };
  }

  // Filter by employee name if provided
  if (employeeName) {
    const employeesByName = await User.find(
      {
        $or: [
          { firstName: { $regex: employeeName, $options: "i" } },
          { lastName: { $regex: employeeName, $options: "i" } },
        ],
      },
      { _id: 1 }
    );
    const employeeIds = employeesByName.map((emp) => emp._id);
    filter.employee = { $in: employeeIds };
  }

  // Filter by status if provided
  if (status) {
    filter.status = status;
  }

  // Filter by date range if both startDate and endDate are provided
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // Calculate skip and limit for pagination
  const skip = (page - 1) * pageSize;
  const limit = parseInt(pageSize);

  // Find tasks matching the filter with pagination
  const tasks = await Task.find(filter)
    .sort({ createdAt: -1 }) // Sort by newest
    .skip(skip) // Skip records for pagination
    .limit(limit) // Limit the number of records
    .populate([
      { path: "employee", select: "firstName lastName department" },
      { path: "remarkBy", select: "firstName lastName" },
    ]);

  // Count total tasks for pagination
  const totalTasks = await Task.countDocuments(filter);

  // Send success response with pagination metadata
  responseHandler(res, 200, {
    data: tasks,
    totalPages: Math.ceil(totalTasks / limit), // Calculate total pages
    currentPage: parseInt(page),
  }, "Tasks retrieved successfully.");
});
/**
 * @desc    Update a task (only if it was created within the last 24 hours)
 * @route   PUT /api/task/:id
 * @access  Private (Employees)
 */
export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  // Find the task by ID
  const task = await Task.findById(id);

  if (!task) {
    const error = new Error("Task not found.");
    error.statusCode = 404; // Not Found
    throw error;
  }

  // Check if the task belongs to the current user
  if (task.employee.toString() !== currentUser.id && req.user.role !== ROLES.MANAGER) {
    const error = new Error("Unauthorized: You can only update your own tasks.");
    error.statusCode = 403; // Forbidden
    throw error;
  }

  // Check if the task was created within the last 24 hours
  const currentTime = new Date();
  const taskCreationTime = new Date(task.createdAt);
  const timeDifferenceInHours = (currentTime - taskCreationTime) / (1000 * 60 * 60); // Convert milliseconds to hours

  if (timeDifferenceInHours > 24) {
    const error = new Error("Task can only be updated within 24 hours of creation.");
    error.statusCode = 400; // Bad Request
    throw error;
  }

  // Update the task
  const updatedTask = await Task.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true } // Return the updated document and run validators
  );

  if (!updatedTask) {
    const error = new Error("Failed to update task.");
    error.statusCode = 500; // Internal Server Error
    throw error;
  }

  // Send success response
  responseHandler(res, 200, updatedTask, "Task updated successfully.");
});

/**
 * @desc    Update   status task (Approve or Decline)
 * @route   PUT /api/task/approve/:id
 * @access  Private (Manager)
 */
export const approveTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remark } = req.body;

  if (!remark) {
    const error = new Error("Remark is required");
    error.statusCode = 404; // Not Found
    throw error;
  }
  // Find the task by ID
  const task = await Task.findById(id);

  if (!task) {
    const error = new Error("Task not found.");
    error.statusCode = 404; // Not Found
    throw error;
  }

  if (task.status !== "Pending") {
    const error = new Error(`Task previously ${task.status}`);
    error.statusCode = 404; // Not Found
    throw error;
  }

  // Update the task
  const updatedTask = await Task.findByIdAndUpdate(
    id,
    {
      $set: {
        status,
        remark,
        remarkBy: req.user.id
      }
    },
    { new: true, runValidators: true } // Return the updated document and run validators
  );

  if (!updatedTask) {
    const error = new Error("Failed to update task.");
    error.statusCode = 500; // Internal Server Error
    throw error;
  }

  // Send success response
  responseHandler(res, 200, updatedTask, `Task ${updatedTask.status}`);
});

/**
 * @desc    Delete a task;
 * @route   PUT /api/task/:id
 * @access  Private (Employees)
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  // Find the task by ID
  const task = await Task.findById(id);

  if (!task) {
    const error = new Error("Task not found.");
    error.statusCode = 404; // Not Found
    throw error;
  }

  // Check if the current user is the task owner or a manager
  const isTaskOwner = task.employee.toString() === currentUser.id;
  const isManager = currentUser.role === ROLES.MANAGER;

  // Allow managers to delete any task
  if (!isManager) {
    // Non-managers can only delete their own tasks with status 'Pending'
    if (!isTaskOwner || task.status !== "Pending") {
      const error = new Error("You can't delete this task.");
      error.statusCode = 403; // Forbidden
      throw error;
    }
  }

  // Delete the task
  await Task.findByIdAndDelete(id);

  // Send success response
  responseHandler(res, 200, null, "Task deleted successfully.");
});

/**
 * @desc    Export Task to PDF;
 * @route   GET /api/task/export-pdf/:id
 * @access  All Users (Employees)
 */
export const exportTaskToPDF = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find the task by ID
  const task = await Task.findById(id).populate([
    { path: "employee", select: "firstName lastName" },
    { path: "remarkBy", select: "firstName lastName" }
  ]);
  if (!task) {
    const error = new Error("Task not found.");
    error.statusCode = 404;
    throw error;
  }

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]); // Ensure page has a defined size

  // Set font and font size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const fontSize = 12;
  const lineHeight = 28;

  let y = page.getHeight() - 60; // Starting Y position

  // Function to add text to PDF
  const drawText = (text, x, y) => {
    page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
  };

  // Add task details
  drawText(`TASK REPORT DETAILS`, 50, y);
  y -= lineHeight;
  y -= lineHeight;
  drawText(`Task ID: ${task._id}`, 50, y);
  y -= lineHeight;
  drawText(`Title: ${task.title}`, 50, y);
  y -= lineHeight;
  drawText(
    `Employee: ${task.employee?.firstName ?? "N/A"} ${task.employee?.lastName ?? ""}`,
    50,
    y
  );
  y -= lineHeight;
  drawText(`Hours Worked: ${task.hoursWorked}`, 50, y);
  y -= lineHeight;
  drawText(`Status: ${task.status}`, 50, y);
  y -= lineHeight;
  drawText(`Description: ${task.description}`, 50, y);
  y -= lineHeight;
  drawText(`Created At: ${task.createdAt ? task.createdAt.toLocaleString() : "N/A"}`, 50, y);
  y -= lineHeight;
  y -= lineHeight;

  drawText(
    `${task.status} By: ${task.remarkBy?.firstName ?? "N/A"} ${task.remarkBy?.lastName ?? ""}`,
    50,
    y
  );
  y -= lineHeight;

  drawText(`Remark: ${task.remark ?? "N/A"}`, 50, y);

  // Serialize the PDF
  const pdfBytes = await pdfDoc.save();

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=task_${task._id}.pdf`);

  // Send the PDF as a response
  res.end(Buffer.from(pdfBytes));
});

/**
 * @desc    Export All Task to PDF;
 * @route   GET /api/task/export-pdf/:id
 * @access  All Users (Employees)
 */
export const exportAllTaskToPDF = asyncHandler(async (req, res) => {
  const { userId } = req.query;

   // Fetch the user details if userId is provided
   let user = null;
   if (userId) {
     user = await User.findById(userId, { firstName: 1, lastName: 1 });
     if (!user) {
       res.status(404);
       throw new Error("User not found.");
     }
   }

     // Define the base query
  const filter = userId ? { employee: userId } : {};

   // Fetch all tasks with populated employee and remarkBy fields
   const tasks = await Task.find(filter)
   .populate([
     { path: "employee", select: "firstName lastName" },
     { path: "remarkBy", select: "firstName lastName" },
   ])
   .sort({ createdAt: -1 }); // Sort by newest first

 if (!tasks || tasks.length === 0) {
   res.status(404);
   throw new Error("No tasks found.");
 }


  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([600, 800]); // Page size: 600x800 points

  // Set font and font size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lineHeight = 20;

  let y = page.getHeight() - 50; // Starting Y position

  // Function to add text to PDF
  const drawText = (text, x, y) => {
    page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
  };

  // Add a title to the PDF
  drawText("ALL TASKS REPORT", 50, y);
  y -= lineHeight * 2; // Add extra space after the title

  // Iterate over tasks and add their details to the PDF
  tasks.forEach((task, index) => {
    // Add a separator between tasks
    if (index > 0) {
      drawText("----------------------------------------", 50, y);
      y -= lineHeight;
    }

    // Add task details
    drawText(`Task ID: ${task._id}`, 50, y);
    y -= lineHeight;
    drawText(`Title: ${task.title}`, 50, y);
    y -= lineHeight;
    drawText(
      `Employee: ${task.employee?.firstName ?? "N/A"} ${task.employee?.lastName ?? ""}`,
      50,
      y
    );
    y -= lineHeight;
    drawText(`Hours Worked: ${task.hoursWorked}`, 50, y);
    y -= lineHeight;
    drawText(`Status: ${task.status}`, 50, y);
    y -= lineHeight;
    drawText(`Description: ${task.description}`, 50, y);
    y -= lineHeight;
    drawText(
      `Created At: ${task.createdAt ? task.createdAt.toLocaleString() : "N/A"}`,
      50,
      y
    );
    y -= lineHeight;
    drawText(
      `${task.status} By: ${task.remarkBy?.firstName ?? "N/A"} ${task.remarkBy?.lastName ?? ""}`,
      50,
      y
    );
    y -= lineHeight;
    drawText(`Remark: ${task.remark ?? "N/A"}`, 50, y);
    y -= lineHeight * 2; // Add extra space after each task

    // Add a new page if the current page is full
    if (y < 50) {
      page = pdfDoc.addPage([600, 800]); // Add a new page
      y = page.getHeight() - 50; // Reset Y position for the new page
    }
  });

  // Serialize the PDF
  const pdfBytes = await pdfDoc.save();

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=all_tasks.pdf`);

  // Send the PDF as a response
  res.end(Buffer.from(pdfBytes));
});

/**
 * @desc    Export All Today Task to PDF;
 * @route   GET /api/task/export-pdf/:id
 * @access  All Users (Employees)
 */
export const exportAllTodayTaskToPDF = asyncHandler(async (req, res) => {
  const { department } = req.query;

  // Get today's date and set the time range (6 AM - 7 PM)
  const today = new Date();
  const startOfDay = new Date(today.setHours(6, 0, 0, 0)); // 6:00 AM
  const endOfDay = new Date(today.setHours(18, 0, 0, 0)); // 6:00 PM

  // Define the base query for tasks created today
  const baseQuery = {
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  };

  // If department is provided, filter tasks by department
  if (department) {
    // Find employees in the specified department
    const employeesInDepartment = await User.find({ department }, { _id: 1 });
    const employeeIds = employeesInDepartment.map((emp) => emp._id);

    // Add employee filter to the query
    baseQuery.employee = { $in: employeeIds };
  }

  // Fetch tasks based on the query
  const tasks = await Task.find(baseQuery)
    .populate([
      { path: "employee", select: "firstName lastName department" },
      { path: "remarkBy", select: "firstName lastName" },
    ])
    .sort({ createdAt: -1 }); // Sort by newest first

  if (!tasks || tasks.length === 0) {
    res.status(404);
    throw new Error("No tasks found.");
  }

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([600, 800]); // Page size: 600x800 points

  // Set font and font size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lineHeight = 20;

  let y = page.getHeight() - 50; // Starting Y position

  // Function to add text to PDF
  const drawText = (text, x, y) => {
    page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
  };

  // Add a title to the PDF
  drawText(
    `TODAY TASKS REPORT${department ? ` - ${department}` : ""} -- ${today.toLocaleDateString("en-GB", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    50,
    y
  );
  y -= lineHeight * 2; // Add extra space after the title

  // Iterate over tasks and add their details to the PDF
  tasks.forEach((task, index) => {
    // Add a separator between tasks
    if (index > 0) {
      drawText("----------------------------------------", 50, y);
      y -= lineHeight;
    }

    // Add task details
    drawText(`Task ID: ${task._id}`, 50, y);
    y -= lineHeight;
    drawText(`Title: ${task.title}`, 50, y);
    y -= lineHeight;
    drawText(
      `Employee: ${task.employee?.firstName ?? "N/A"} ${task.employee?.lastName ?? ""}`,
      50,
      y
    );
    y -= lineHeight;
    drawText(`Department: ${task.employee?.department ?? "N/A"}`, 50, y); // Add department
    y -= lineHeight;
    drawText(`Hours Worked: ${task.hoursWorked}`, 50, y);
    y -= lineHeight;
    drawText(`Status: ${task.status}`, 50, y);
    y -= lineHeight;
    drawText(`Description: ${task.description}`, 50, y);
    y -= lineHeight;
    drawText(
      `Created At: ${task.createdAt ? task.createdAt.toLocaleString() : "N/A"}`,
      50,
      y
    );
    y -= lineHeight;
    drawText(
      `${task.status} By: ${task.remarkBy?.firstName ?? "N/A"} ${task.remarkBy?.lastName ?? ""}`,
      50,
      y
    );
    y -= lineHeight;
    drawText(`Remark: ${task.remark ?? "N/A"}`, 50, y);
    y -= lineHeight * 2; // Add extra space after each task

    // Add a new page if the current page is full
    if (y < 50) {
      page = pdfDoc.addPage([600, 800]); // Add a new page
      y = page.getHeight() - 50; // Reset Y position for the new page
    }
  });

  // Serialize the PDF
  const pdfBytes = await pdfDoc.save();

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${department ? `${department}-Task-Report.pdf` : "All-Task-Report.pdf"}`
  );

  // Send the PDF as a response
  res.end(Buffer.from(pdfBytes));
});

/**
 * @desc    Export Task to Excel;
 * @route   GET /api/task/export-excel/:id
 * @access  All Users (Employees)
 */
export const exportSingleTaskToExcel = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the task by ID
  const task = await Task.findById(id).populate([
    { path: "employee", select: "firstName lastName" },
    { path: "remarkBy", select: "firstName lastName" }
  ]);

  if (!task) {
    const error = new Error("Task not found.");
    error.statusCode = 404;
    throw error;
  }

  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Task Details");

  // Add headers to the worksheet
  worksheet.columns = [
    { header: "Field", key: "field", width: 20 },
    { header: "Value", key: "value", width: 50 }
  ];

  // Add task details to the worksheet
  worksheet.addRow({ field: "Task ID", value: task._id });
  worksheet.addRow({ field: "Title", value: task.title });
  worksheet.addRow({ field: "Description", value: task.description });
  worksheet.addRow({ field: "Hours Worked", value: task.hoursWorked });
  worksheet.addRow({ field: "Status", value: task.status });
  worksheet.addRow({ field: "Date", value: task.createdAt.toLocaleString() });
  worksheet.addRow({
    field: "Employee",
    value: `${task.employee?.firstName} ${task.employee?.lastName}`
  });
  worksheet.addRow({
    field: `${task.status !== 'Pending' ? task.status : 'Supervised' } By`,
    value: `${task.remarkBy?.firstName !== undefined ? task.remarkBy.firstName : "-" } ${task.remarkBy?.lastName !== undefined ? task.remarkBy.lastName : "-" }`
  });
  worksheet.addRow({ field: "Remark", value: task.remark || "-" });

  // Set response headers for Excel download
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=task_${task._id}.xlsx`);

  // Write the workbook to the response
  await workbook.xlsx.write(res);
  res.end();
});

export const exportAllTasksToExcel = asyncHandler(async (req, res) => {
  const { userId } = req.query;

  // Fetch the user details if userId is provided
  let user = null;
  if (userId) {
    user = await User.findById(userId, { firstName: 1, lastName: 1 });
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }
  }

    // Define the base query
 const filter = userId ? { employee: userId } : {};

  // Fetch all tasks with populated employee and remarkBy fields
  const tasks = await Task.find(filter)
  .populate([
    { path: "employee", select: "firstName lastName" },
    { path: "remarkBy", select: "firstName lastName" },
  ])
  .sort({ createdAt: -1 }); // Sort by newest first

if (!tasks || tasks.length === 0) {
  res.status(404);
  throw new Error("No tasks found.");
}
  // Create a new workbook and add a worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("All Tasks");

  // Define the columns for the worksheet
  worksheet.columns = [
    { header: "Task ID", key: "id", width: 25 },
    { header: "Title", key: "title", width: 30 },
    { header: "Description", key: "description", width: 40 },
    { header: "Hours Worked", key: "hoursWorked", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Created At", key: "createdAt", width: 20 },
    { header: "Employee", key: "employee", width: 25 },
    { header: "Remark By", key: "remarkBy", width: 25 },
    { header: "Remark", key: "remark", width: 30 }
  ];

  // Add rows with task data
  tasks.forEach((task) => {
    worksheet.addRow({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      hoursWorked: task.hoursWorked,
      status: task.status,
      createdAt: task.createdAt.toLocaleString(),
      employee: task.employee ? `${task.employee.firstName} ${task.employee.lastName}` : "N/A",
      remarkBy: task.remarkBy ? `${task.remarkBy.firstName} ${task.remarkBy.lastName}` : "N/A",
      remark: task.remark || "N/A"
    });
  });

  // Set response headers for Excel download
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=all_tasks.xlsx`);

  // Write the workbook to the response
  await workbook.xlsx.write(res);
  res.end();
});

export const exportTodayTasksToExcel = asyncHandler(async (req, res) => {

  const { department } = req.query;

  // Get today's date and set the time range (6 AM - 7 PM)
  const today = new Date();
  const startOfDay = new Date(today.setHours(6, 0, 0, 0)); // 6:00 AM
  const endOfDay = new Date(today.setHours(18, 0, 0, 0)); // 6:00 PM

  // Fetch tasks created between 6 AM and 7 PM today
  // Define the base query for tasks created today
  const baseQuery = {
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  };

  // If department is provided, filter tasks by department
  if (department) {
    // Find employees in the specified department
    const employeesInDepartment = await User.find({ department }, { _id: 1 });
    const employeeIds = employeesInDepartment.map((emp) => emp._id);

    // Add employee filter to the query
    baseQuery.employee = { $in: employeeIds };
  }

  // Fetch tasks based on the query
  const tasks = await Task.find(baseQuery)
    .populate([
      { path: "employee", select: "firstName lastName department" },
      { path: "remarkBy", select: "firstName lastName" },
    ])
    .sort({ createdAt: -1 }); // Sort by newest first


    if (!tasks || tasks.length === 0) {
      res.status(404);
      throw new Error("No tasks found.");
    }

  // Create a new workbook and add a worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("All Today Tasks");

  // Define the columns for the worksheet
  worksheet.columns = [
    { header: "Task ID", key: "id", width: 25 },
    { header: "Title", key: "title", width: 30 },
    { header: "Description", key: "description", width: 40 },
    { header: "Hours Worked", key: "hoursWorked", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Created At", key: "createdAt", width: 20 },
    { header: "Employee", key: "employee", width: 25 },
    { header: "Department", key: "department", width: 25 },
    { header: "Remark By", key: "remarkBy", width: 25 },
    { header: "Remark", key: "remark", width: 30 }
  ];

  // Add rows with task data
  tasks.forEach((task) => {
    worksheet.addRow({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      hoursWorked: task.hoursWorked,
      status: task.status,
      createdAt: task.createdAt.toLocaleString(),
      employee: task.employee ? `${task.employee.firstName} ${task.employee.lastName}` : "N/A",
      department: task.employee ? `${task.employee.department}` : "N/A",
      remarkBy: task.remarkBy ? `${task.remarkBy.firstName} ${task.remarkBy.lastName}` : "N/A",
      remark: task.remark || "N/A"
    });
  });

  // Set response headers for Excel download
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Employees_Daily_Report.xlsx`
  );

  // Write the workbook to the response
  await workbook.xlsx.write(res);
  res.end();
});
