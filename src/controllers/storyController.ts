import { Request, Response } from "express";
import OpenAI from "openai";
import { generateTTS, OpenAIAllowedVoices } from "../services/ttsService";
import Story from "../models/storyModel";
import db from "../database/connection";
import logger from "../utils/logger";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate story text using OpenAI's Node.js client library
const generateStoryText = async (
  language: string,
  languageCode: string,
  text: string
): Promise<string> => {
  try {
    const prompt = text || "Once upon a time..."; // Default prompt if not provided

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a storyteller. Please write a story in ${language}. After generating before sending it to me check the generated story to be sure it doesn't include any errors in ${language}, if yes, then fix it.`,
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
      user: languageCode, // Add the language code as part of the user context to enforce language usage
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error) {
    console.error("Error generating story text with OpenAI API:", error);
    throw new Error("Failed to generate story text");
  }
};

export const generateStory = async (req: Request, res: Response) => {
  const { language, languageCode, voice, text } = req.body;
  const voiceChoice: OpenAIAllowedVoices = voice || "alloy"; // Default to 'alloy' if no voice is specified

  try {
    if (db.readyState !== 1) {
      await new Promise((resolve) => db.once("open", resolve));
    }

    const storyText = await generateStoryText(language, languageCode, text);
    const ttsUrl = await generateTTS(storyText, voiceChoice); // Use OpenAI for TTS
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
