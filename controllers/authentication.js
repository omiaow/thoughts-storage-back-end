import user from "../models/user.js";
import validator from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

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

    if (confirmPassword !== password) {
      return res.status(400).json({ message: "Password doesn't match" });
    }

    const candidate = await user.findOne({ email: email });

    if (candidate) {
      return res.status(400).json({ message: "This email exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new user({ email: email, password: hashedPassword });

    await newUser.save();

    const transporter = nodemailer.createTransport({
      service: "outlook",
      auth: {
        user: process.env.customEmail,
        pass: process.env.emailPassword
      }
    });

    const mailOptions = {
      from: "thoughts-storage@outlook.com",
      to: email,
      subject: "Your have been registered for Thoughts Storage!",
      text: "Hi,\n\nWelcome to Thoughts Storage!\nNow you are part of TS community.\n\nThank you for choosing TS,\nOmurzak Keldibekov (TS Developer)"

    };

    transporter.sendMail(mailOptions);

    res.status(201).json({ message: "User registered" });

  } catch (e) {
    res.status(500).json({ message: "Something went wrong, please try it againg" });
  }
};

// check if login request is valid
export const loginValidator = [
  validator.check("email", "Enter valid Email").isEmail(),
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

// new password request
export const newPassword = async (req, res) => {
  try {

    const errors = validator.validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Invalid data to reset the password"
      });
    }

    const { email, password, confirmPassword } = req.body;

    if (confirmPassword !== password) {
      return res.status(400).json({ message: "Password doesn't match" });
    }

    const enquirer = await user.findOne({ email: email });

    if (!enquirer) {
      return res.status(400).json({ message: "This email doesn't exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const transporter = nodemailer.createTransport({
      service: "outlook",
      auth: {
        user: process.env.customEmail,
        pass: process.env.emailPassword
      }
    });

    const confirmUrl = `${process.env.websiteLink}/Confirm?id=${enquirer.id}&encryptedPassword=${hashedPassword}`

    const mailOptions = {
      from: "thoughts-storage@outlook.com",
      to: email,
      subject: "Confirm new password",
      text: `Hi,\n\nIf you are trying to reset your password, click the link below.\n${confirmUrl}\n\nThank you for choosing TS,\nOmurzak Keldibekov (TS Developer)`
    };

    transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Request sent!" });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong, please try it againg" });
  };
};

// new password request
export const changePassword = async (req, res) => {
  try {

    const { id, encryptedPassword } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Bad identification" });
    }

    if (!encryptedPassword) {
      return res.status(400).json({ message: "Bad encryptedPassword" });
    }

    await user.findOneAndUpdate({ _id: id }, { password: encryptedPassword })
      .then(updatedDocument => {
        if(updatedDocument) {
          return res.status(201).json({ message: "Successfully updated." });
        } else {
          return res.status(400).json({ message: "No document matches the provided query." });
        }
      }).catch(err => res.status(400).json({ message: "Can't find user data" }));

  } catch (e) {
    res.status(500).json({ message: "Something went wrong, please try it againg" });
  };
};
