import Quiz from "./model.js";

export const createQuiz = async (quiz) => {
  try {
    const newQuiz = new Quiz(quiz);
    return await newQuiz.save();
  } catch (error) {
    throw new Error(`Error creating quiz: ${error.message}`);
  }
};

export const findAllQuizzes = async () => {
  try {
    return await Quiz.find();
  } catch (error) {
    throw new Error(`Error finding quizzes: ${error.message}`);
  }
};

export const findQuizById = async (id) => {
  try {
    return await Quiz.findById(id);
  } catch (error) {
    throw new Error(`Error finding quiz by ID: ${error.message}`);
  }
};

export const findQuizzesByCourse = async (courseNumber) => {
  try {
    return await Quiz.find({ course_number: courseNumber });
  } catch (error) {
    throw new Error(`Error finding quizzes by course: ${error.message}`);
  }
};

export const updateQuiz = async (id, quiz) => {
  try {
    return await Quiz.findByIdAndUpdate(id, quiz, { new: true });
  } catch (error) {
    throw new Error(`Error updating quiz: ${error.message}`);
  }
};

export const deleteQuiz = async (id) => {
  try {
    return await Quiz.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Error deleting quiz: ${error.message}`);
  }
};
