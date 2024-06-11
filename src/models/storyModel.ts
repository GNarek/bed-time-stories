import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  text: String,
  ttsUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const Story = mongoose.model("Story", storySchema);

export default Story;
