import express from "express";
import { register, login, newPassword, changePassword, registrationValidator, loginValidator } from "../controllers/authentication.js";

const router = express.Router();

router.post('/register', registrationValidator, register);
router.post('/login', loginValidator, login);
router.post('/newPassword', registrationValidator, newPassword);
router.post('/changePassword', changePassword);

export default router;
