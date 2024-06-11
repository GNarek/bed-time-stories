import { Router } from "express";
import { generateStory, getStory } from "../controllers/storyController";
import { checkDbConnection } from "../middleware/checkDbConnection";

const router = Router();

router.post("/generate", checkDbConnection, generateStory);
router.get("/:id", checkDbConnection, getStory);

export default router;
