const mongoose = require('mongoose');

// Define the schema for quiz questions
const questionSchema = new mongoose.Schema({
  questionId: {
    type: Number
  },
  questionType: {
    type: String,
    enum: ['Multiple Choice', 'Fill in Blank', 'TrueORFalse'],
    required: true
  },
  questionPoints: {
    type: String,
    required: true
  },
  questionContent: {
    type: String,
    required: true
  },
  options: {
    type: [String]
  },
  CorrectAns: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  questionDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  }
});

// Define the schema for quizzes
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    default: "Graded Quiz"
  },
  points: {
    type: Number,
    required: true
  },
  timeLimit: {
    type: Number,
    required: true
  },
  assignmentGroup: {
    type: String,
    enum: ['EXAMS', 'QUIZZES'],
    required: true
  },
  browserRequired: {
    type: Boolean,
    default: false
  },
  webcamRequired: {
    type: Boolean,
    default: false
  },
  availableFrom: {
    type: String
  },
  availableUntil: {
    type: String
  },
  due: {
    type: String,
    required: true
  },
  questionsNum: {
    type: Number,
    required: true
  },
  questions: {
    type: [questionSchema],
    required: true
  },
  courses: {
    type: String,
    required: true
  },
  howManyAttempts: {
    type: Number,
    default: 0
  },
  published: {
    type: Boolean,
    required: true
  }
});

// Create a model from the schema
const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
