import Course from "./model.js";

export const createCourse = async (course) => {
  try {
    const newCourse = new Course(course);
    return await newCourse.save();
  } catch (error) {
    throw new Error(`Error creating course: ${error.message}`);
  }
};

export const findAllCourses = async () => {
  try {
    return await Course.find();
  } catch (error) {
    throw new Error(`Error finding courses: ${error.message}`);
  }
};

export const findCourseById = async (id) => {
  try {
    return await Course.findById(id);
  } catch (error) {
    throw new Error(`Error finding course by ID: ${error.message}`);
  }
};

export const findCourseByNumber = async (number) => {
  try {
    return await Course.findOne({ number });
  } catch (error) {
    throw new Error(`Error finding course by number: ${error.message}`);
  }
};

export const updateCourse = async (id, course) => {
  try {
    return await Course.findByIdAndUpdate(id, course, { new: true });
  } catch (error) {
    throw new Error(`Error updating course: ${error.message}`);
  }
};

export const deleteCourse = async (id) => {
  try {
    return await Course.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Error deleting course: ${error.message}`);
  }
};
