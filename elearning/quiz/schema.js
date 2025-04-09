import mongoose from 'mongoose';


// Define the schema for quiz questions
const questionSchema = new mongoose.Schema({
  questionId: {
    type: Number
  },
  questionType: {
    type: String,
    enum: ['Multiple Choice', 'Fill in Blank', 'TrueORFalse'],
    
  },
  questionPoints: {
    type: String,
    
  },
  questionContent: {
    type: String,
    
  },
  options: {
    type: [String]
  },
  CorrectAns: {
    type: mongoose.Schema.Types.Mixed,
    
  },
  questionDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    
  }
});

// Define the schema for quizzes
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    
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
    
  },
  timeLimit: {
    type: Number,
    
  },
  assignmentGroup: {
    type: String,
    enum: ['EXAMS', 'QUIZZES'],
    
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
    
  },
  questionsNum: {
    type: Number,
    
  },
  questions: {
    type: [questionSchema],
    
  },
  courses: {
    type: String,
    
  },
  howManyAttempts: {
    type: Number,
    default: 0
  },
  published: {
    type: Boolean,
    
  }
}, { collection: 'quiz' });

export default quizSchema;