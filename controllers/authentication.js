import user from "../models/user.js";
import validator from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// check if registration request is valid
export const registrationValidator = [
  validator.check("email", "Invalid Email").isEmail(),
  validator.check("password", "Minimum password length 6 characters")
    .isLength({ min: 6 })
];

// register
export const register = async (req, res) => {
  try {

    const errors = validator.validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Invalid data during registration"
      });
    }

    const { email, password, confirmPassword } = req.body;

    const candidate = await user.findOne({ email: email });

    if (confirmPassword !== password) {
      return res.status(400).json({ message: "Password doesn't match" });
    }

    if (candidate) {
      return res.status(400).json({ message: "This email exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new user({ email: email, password: hashedPassword });

    await newUser.save();

    res.status(201).json({ message: "User registered" });

  } catch (e) {
    res.status(500).json({ message: "Something went wrong, please try it againg" });
  }
};

// check if login request is valid
export const loginValidator = [
  validator.check("email", "Enter valid Email").normalizeEmail().isEmail(),
  validator.check("password", "Enter password").exists()
];

// sign in
export const login = async (req, res) => {
  try {

    const errors = validator.validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Invalid data during longging in"
      });
    }

    const { email, password } = req.body;

    const enteringUser = await user.findOne({ email: email });

    if (!enteringUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, enteringUser.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { userId: enteringUser.id },
      process.env.jwtSecret,
      { expiresIn: "24h" }
    );

    res.json({ token: token, userId: enteringUser.id });

  } catch (e) {
    res.status(500).json({ message: "Something went wrong, please try it againg" });
  }
};
