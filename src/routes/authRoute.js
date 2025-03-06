import { Router } from "express";
import { Login, Logout } from "../controllers/authController.js";
import { authenticateUser, emailToLowerCase, ensureGuest } from "../middlewares/authorisations/authorisation.js";
import { LoginFormValidator } from "../middlewares/validators/LoginValidator.js";
const router = Router();


router.post('/login', ensureGuest, LoginFormValidator, emailToLowerCase, Login)
router.post('/logout', authenticateUser, Logout)


export default router