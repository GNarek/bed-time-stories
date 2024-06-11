import mongoose from "mongoose";

const mongoUri = "mongodb://localhost:27017/bedtime-stories"; // Replace with your MongoDB URI

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("MongoDB connection is open");
});

export default db;
