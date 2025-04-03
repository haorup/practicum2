import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import assignmentRoutes from "./assignment/routes.js";
import courseRoutes from "./course/routes.js";
import quizRoutes from "./quiz/routes.js";
import userRoutes from "./user/routes.js";
import enrollmentRoutes from "./enrollment/routes.js";

const CONNECTION_STRING = "mongodb://127.0.0.1:27017/elearning";
mongoose.connect(CONNECTION_STRING);
const app = express();
app.use(cors());
app.use(express.json());

// Register routes
app.use(assignmentRoutes);
app.use(courseRoutes);
app.use(quizRoutes);
app.use(userRoutes);
app.use(enrollmentRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT || 4000}`);
});