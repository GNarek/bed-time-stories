import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import logger from "../utils/logger";

// TODO:
const jwtSecret = "your_jwt_secret"; // You should use an environment variable in a real application

export const register = async (req: Request, res: Response) => {
  const { username, password, email } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const user = new User({ username, password, email });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    logger.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    logger.error("Error logging in:", error);
    res.status(500).json({ error: "Error logging in" });
  }
};
