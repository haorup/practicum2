import mongoose from "mongoose";
import courseSchema from "./schema.js";

const Course = mongoose.model("Course", courseSchema);

export default Course;
