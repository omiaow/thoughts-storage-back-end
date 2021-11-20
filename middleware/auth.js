import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const auth = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {

    const token = req.headers["authorization"].split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ message: "No authorization" });
    }

    const decoded = jwt.verify(token, process.env.jwtSecret);
    req.user = decoded;
    next();

  } catch (e) {
    return res.status(401).json({ message: "No authorization" });
  }
}

export default auth;
