import mongoose from "mongoose";
import courseSchema from "./schema.js";

const Course = mongoose.model("course", courseSchema);

export default Course;
