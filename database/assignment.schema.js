import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    course_number: { type: String, required: true },
    points: { type: Number, required: true },
    releasedOrNot: { type: Boolean, default: false },
    startingDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    outDatedOrNot: { type: Boolean, default: false },
    content: { type: String },
  },
  { collection: "assignments" }
);

export default assignmentSchema;