import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import { generateTTS } from "../services/ttsService";
import Story from "../models/storyModel";
import db from "../database/connection";
import logger from "../utils/logger";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate story text using OpenAI's Node.js client library
const generateStoryText = async (): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a storyteller." },
        { role: "user", content: "Once upon a time..." },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error) {
    console.error("Error generating story text with OpenAI API:", error);
    throw new Error("Failed to generate story text");
  }
};

export const generateStory = async (req: Request, res: Response) => {
  try {
    if (db.readyState !== 1) {
      await new Promise((resolve) => db.once("open", resolve));
    }

    const storyText = await generateStoryText();
    const ttsUrl = await generateTTS(storyText, true); // Set to true to use OpenAI for TTS
    const story = new Story({ text: storyText, ttsUrl, userId: req.user?.id });
    await story.save();
    res.json({ id: story._id, story: storyText, ttsUrl });
    logger.info("Story generated", { id: story._id });
  } catch (error) {
    logger.error("Error generating story:", error);
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
    logger.error("Error fetching story:", error);
    res.status(500).json({ error: "Failed to fetch story" });
  }
};
