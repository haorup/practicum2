const mongoose = require('mongoose');

// Define the schema for assignments
const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  course_number: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  releasedOrNot: {
    type: Boolean,
    required: true
  },
  startingDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  outDatedOrNot: {
    type: Boolean,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  assignmentGroup: {
    type: String,
    enum: ['EXAMS', 'QUIZZES'],
    required: true
  }
});

// Create a model from the schema
const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
