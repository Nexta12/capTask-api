import { Router } from "express";
import { allowedRoles, authenticateUser } from "../middlewares/authorisations/authorisation.js";
import {  submitTask, updateTask, approveTask, deleteTask , exportTaskToPDF, exportSingleTaskToExcel , getSingleTask, getAllTasks, exportAllTasksToExcel, exportTodayTasksToExcel } from "../controllers/taskManagerController.js";
import { ROLES } from "../constants/UserRoles.js";
import {TaskFormValidator } from "../middlewares/validators/TaskFormValidator.js";


const router = Router();

router.post('/create', authenticateUser, allowedRoles([ROLES.EMPLOYEE, ROLES.ICT]),TaskFormValidator, submitTask )
router.get('/getAll', authenticateUser, allowedRoles([ ROLES.ICT, ROLES.MANAGER, ROLES.ADMIN]), getAllTasks )

router.get('/getOne/:id', authenticateUser, getSingleTask )

router.put('/update/:id', authenticateUser, allowedRoles([ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ICT]), updateTask )

router.put('/approve/:id', authenticateUser, allowedRoles([ ROLES.MANAGER, ROLES.ICT]), approveTask )

router.delete('/delete/:id', authenticateUser, allowedRoles([ROLES.ICT, ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ICT]), deleteTask )

router.get('/export-pdf/:id', authenticateUser, exportTaskToPDF )
router.get('/export-excel/:id', authenticateUser, exportSingleTaskToExcel )
router.get('/excel/all',  authenticateUser, exportAllTasksToExcel )
router.get('/excel/export-today-task', exportTodayTasksToExcel )


export default router;