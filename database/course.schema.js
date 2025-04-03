import mongoose from 'mongoose';

// Define the schema for individual lessons
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  releasedOrNot: { type: Boolean, default: false }
});

// Define the main course schema
const courseSchema = new mongoose.Schema({
  number: { type: String, required: true },
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  department: String,
  credits: { type: Number, required: true },
  description: String,
  lessons: [lessonSchema]
}, { collection: "courses" });

export default courseSchema;
