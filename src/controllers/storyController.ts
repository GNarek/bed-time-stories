import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { generateTTS } from "../services/ttsService";
import Story from "../models/storyModel";
import db from "../database/connection";
import logger from "../utils/logger";

const generateStoryText = (): string => {
  return "Once upon a time in a magical land...";
};

export const generateStory = async (req: Request, res: Response) => {
  try {
    if (db.readyState !== 1) {
      await new Promise((resolve) => db.once("open", resolve));
    }

    const storyText = generateStoryText();
    const ttsUrl = await generateTTS(storyText);
    const story = new Story({ text: storyText, ttsUrl, userId: req.user?.id });
    await story.save();
    res.json({ id: story._id, story: storyText, ttsUrl });
    logger.info("Story generated", { id: story._id });
  } catch (error) {
    logger.error("Error generating story", { error });
    res.status(500).json({ error: "Failed to generate story" });
  }
};

export const getStory = async (req: Request, res: Response) => {
  try {
    const storyId = req.params.id;
    const story = await Story.findById(storyId);
    if (story) {
      res.json({ id: story._id, story: story.text, ttsUrl: story.ttsUrl });
    } else {
      res.status(404).json({ error: "Story not found" });
    }
  } catch (error) {
    logger.error("Error fetching story", { error });
    res.status(500).json({ error: "Failed to fetch story" });
  }
};
