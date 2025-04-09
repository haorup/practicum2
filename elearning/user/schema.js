import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String},
    password: { type: String},
    firstName: String,
    email: String,
    lastName: String,
    dob: Date,
    userID: {type: Number},
    role: {
      type: String,
      enum: ["STUDENT", "FACULTY", "ADMIN", "USER"],
      default: "USER",
    },
    lastActivity: Date,
  },
  { 
    collection: "user",
    versionKey: false 
  }
);

export default userSchema;