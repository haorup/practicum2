import mongoose from "mongoose";
import quizSchema from "./schema.js";

const Quiz = mongoose.model("quiz", quizSchema);

export default Quiz;
