import mongoose from "mongoose";
import userSchema from "./schema.js";

// Register the model explicitly
const User = mongoose.model("user", userSchema);

export default User;
