import { Router } from "express";
const router = Router();
import authRoutes from "./authRoute.js";
import userRoutes from "./userRoute.js"
import taskManagerRoute from "./taskManagerRoute.js"
import nodeCron from "../services/cronJobs.js"


router.use('/secure', authRoutes)
router.use('/user', userRoutes)
router.use('/task', taskManagerRoute)
router.use('/cron', nodeCron)



export default router