import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import config from "config";

import authRoutes from "./routes/auth.js"
import formRoutes from "./routes/form.js"

const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.json({ limit: "30mb", extended: true }));

app.use(cors());

app.use("/auth", authRoutes);
app.use("/form", formRoutes);

const CONNECTION_URL = config.get("mongoURL");
const PORT = process.env.PORT || config.get("port");

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
  .catch((error) => console.log(error.message));

mongoose.connect(CONNECTION_URL).then(()=>{console.log('...')});
