import { Router } from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import { generateStory, getStory } from "../controllers/storyController";
import { checkDbConnection } from "../middleware/checkDbConnection";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.use("/auth", authRoutes); // Public routes
router.use("/user", authenticate, userRoutes); // Protected routes
router.post("/generate", checkDbConnection, authenticate, generateStory); // Protected route
router.get("/:id", checkDbConnection, authenticate, getStory); // Protected route

export default router;
