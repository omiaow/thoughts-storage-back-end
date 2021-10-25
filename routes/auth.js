import express from "express";
import { register, login, registrationValidator, loginValidator } from "../controllers/authentication.js";

const router = express.Router();

router.post('/register', registrationValidator, register);
router.post('/login', registrationValidator, login);

export default router;
