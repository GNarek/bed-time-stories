import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger"; // Ensure you have a logger setup

// TODO:
const jwtSecret = "your_jwt_secret"; // Ensure this is set properly, ideally from an environment variable

interface JwtPayload {
  id: string;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    logger.error("No token provided");
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decoded; // Add user property to request object
    logger.info("Token verified", decoded);
    next();
  } catch (error) {
    logger.error("Invalid token", error);
    res.status(401).json({ error: "Invalid token" });
  }
};
