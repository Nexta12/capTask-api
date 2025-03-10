import { Router } from "express";
import { allowedRoles, authenticateUser } from "../middlewares/authorisations/authorisation.js";
import { createUser, updateUser, getAllUsers, deleteUser, getAUser, updateUserPassword  } from "../controllers/userController.js";
import { ROLES } from "../constants/UserRoles.js";
import { CreateUserFormValidator } from "../middlewares/validators/CreateUserValidator.js";


const router = Router();

router.post('/create', authenticateUser, allowedRoles([ROLES.ICT, ROLES.ADMIN, ROLES.MANAGER]),CreateUserFormValidator, createUser )

router.get('/getAll', authenticateUser, allowedRoles([ROLES.ICT, ROLES.ADMIN, ROLES.MANAGER]), getAllUsers )

router.put('/update/:id', authenticateUser, updateUser )
router.put('/update-password/:id', authenticateUser, updateUserPassword )

router.get('/getUser/:id', authenticateUser, getAUser )

router.delete('/delete/:id', authenticateUser, allowedRoles([ROLES.ICT, ROLES.MANAGER]), deleteUser )



export default router;