import { Router } from "express";
import { Login, Logout, ValidateAuth, ForgotPassword, ResetPassword, VerifyOtp } from "../controllers/authController.js";
import { authenticateUser, emailToLowerCase, ensureGuest,  checkJwt, } from "../middlewares/authorisations/authorisation.js";
import { LoginFormValidator } from "../middlewares/validators/LoginValidator.js";
const router = Router();


router.post('/login', ensureGuest, LoginFormValidator, emailToLowerCase, Login)
router.post('/logout', authenticateUser, Logout)
router.get("/validate", checkJwt, ValidateAuth);

router.post("/forgot-password", ensureGuest, ForgotPassword);
router.post("/reset-password", ensureGuest, ResetPassword);
router.post("/verify-otp", ensureGuest, VerifyOtp);


export default router