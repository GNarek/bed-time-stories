import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const region = "us-east-2"; // Replace with your S3 bucket's region

const s3 = new S3Client({
  region: region,
  endpoint: `https://s3.${region}.amazonaws.com`, // Ensure this matches your bucket's region
});

const BUCKET_NAME = "bedtime-stories-tts-bucket";

export type OpenAIAllowedVoices =
  | "alloy"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "shimmer";

const generateOpenAITTS = async (
  text: string,
  voice: OpenAIAllowedVoices
): Promise<string> => {
  const filePath = path.resolve("./speech.mp3");
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);

    const key = `${uuidv4()}.mp3`;
    const fileStream = fs.createReadStream(filePath);

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileStream,
        ContentType: "audio/mpeg",
      },
    });

    await upload.done();
    fs.unlinkSync(filePath); // Remove the local file after uploading

    return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Error in generateOpenAITTS:", error);
    throw new Error("Failed to generate TTS with OpenAI");
  }
};

export const generateTTS = async (
  text: string,
  voice: OpenAIAllowedVoices = "alloy"
): Promise<string> => {
  return await generateOpenAITTS(text, voice);
};
