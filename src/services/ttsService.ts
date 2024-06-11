import {
  PollyClient,
  SynthesizeSpeechCommand,
  OutputFormat,
  VoiceId,
} from "@aws-sdk/client-polly";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from "uuid";

// Initialize AWS clients
const region = "us-east-2"; // Replace with your S3 bucket's region
const polly = new PollyClient({ region });

const s3 = new S3Client({
  region,
  endpoint: `https://s3.${region}.amazonaws.com`, // Ensure this matches your bucket's region
});

const BUCKET_NAME = "bedtime-stories-tts-bucket";

export const generateTTS = async (text: string): Promise<string> => {
  const pollyParams = {
    OutputFormat: OutputFormat.MP3,
    Text: text,
    VoiceId: VoiceId.Joanna,
  };

  try {
    const command = new SynthesizeSpeechCommand(pollyParams);
    const data = await polly.send(command);

    const key = `${uuidv4()}.mp3`;

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: data.AudioStream,
        ContentType: "audio/mpeg",
      },
    });

    await upload.done();

    return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Error in generateTTS:", error);
    throw new Error("Failed to generate TTS");
  }
};
