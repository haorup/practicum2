import mongoose from 'mongoose';

// Define the schema for individual lessons
const lessonSchema = new mongoose.Schema({
  title: { type: String },
  description: String,
  releasedOrNot: { type: Boolean, default: false }
});

// Define the main course schema
const courseSchema = new mongoose.Schema({
  number: { type: String, required: true },
  name: { type: String, required: true },
  term: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, 
        ref: "user" },
  department: String,
  credits: { type: Number, required: true },
  description: String,
  lessons: [lessonSchema]
}, { collection: "course" });

export default courseSchema;
