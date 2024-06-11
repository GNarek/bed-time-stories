import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const checkDbConnection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (mongoose.connection.readyState !== 1) {
    // 1 means connected
    return res.status(503).json({ error: "Database not connected" });
  }
  next();
};
