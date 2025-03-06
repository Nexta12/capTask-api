import { Router } from "express";
import { allowedRoles, authenticateUser } from "../middlewares/authorisations/authorisation.js";
import { createUser, updateUser, deleteUser } from "../controllers/userController.js";
import { ROLES } from "../constants/UserRoles.js";
import { CreateUserFormValidator } from "../middlewares/validators/CreateUserValidator.js";


const router = Router();

router.post('/create', authenticateUser, allowedRoles([ROLES.ICT, ROLES.ADMIN, ROLES.MANAGER]),CreateUserFormValidator, createUser )
router.put('/update/:id', authenticateUser, updateUser )
router.delete('/delete/:id', authenticateUser, allowedRoles([ROLES.ICT, ROLES.ADMIN, ROLES.MANAGER]), deleteUser )



export default router;