import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import User from "./models/User";
import { encode } from "./token";

const app = express();

app.use(express.json());
app.use(cookieParser());

const port = 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/soundify";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.post("/register", async (req, res) => {
  const { username, password }: { username: string; password: string } =
    req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const newUser = new User({ username, password });
    await newUser.save();
    const token = encode({username});
    res.cookie("token", token);
    return res.status(201).json({ message: "User created successfully" });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Username already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password }: { username: string; password: string } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = encode({username});
    res.cookie("token", token);

    return res.status(200).json({ message: "Login successful" });
  } catch (err: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
