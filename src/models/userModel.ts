import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Define an interface for the User document
interface IUser extends Document {
  username: string;
  password: string;
  email?: string;
  comparePassword(password: string): Promise<boolean>;
}

// Define the user schema
const userSchema: Schema<IUser> = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, unique: true },
});

// Middleware to hash the password before saving the user
userSchema.pre("save", async function (next) {
  const user = this as IUser;

  if (!user.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);

  user.password = hash;
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

// Define and export the User model
const User = mongoose.model<IUser>("User", userSchema);
export default User;
