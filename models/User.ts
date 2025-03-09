// models/User.ts
import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the interface for User document
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

// Create the schema
const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters long"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
