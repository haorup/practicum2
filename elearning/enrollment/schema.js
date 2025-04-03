import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "user", 
      required: true 
    },
    course: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "course", 
      required: true 
    },
    enrollmentDate: { 
      type: Date, 
      default: Date.now 
    },
    status: { 
      type: String, 
      enum: ["ACTIVE", "COMPLETED", "DROPPED", "PENDING"], 
      default: "ACTIVE" 
    },
    grade: { 
      type: Number 
    },
    lastActivity: { 
      type: Date 
    }
  },
  { collection: "enrollment" }
);

// Create a compound index to ensure unique student-course pairs
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default enrollmentSchema;
