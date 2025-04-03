import Enrollment from "./model.js";

// Create a new enrollment
export const createEnrollment = async (enrollment) => {
  try {
    const newEnrollment = new Enrollment(enrollment);
    return await newEnrollment.save();
  } catch (error) {
    throw new Error(`Error creating enrollment: ${error.message}`);
  }
};

// Find all enrollments
export const findAllEnrollments = async () => {
  try {
    return await Enrollment.find()
      .populate("user", "username firstName lastName email")
      .populate("course", "number name");
  } catch (error) {
    throw new Error(`Error finding enrollments: ${error.message}`);
  }
};

// Find enrollment by ID
export const findEnrollmentById = async (id) => {
  try {
    return await Enrollment.findById(id)
      .populate("user", "username firstName lastName email")
      .populate("course", "number name");
  } catch (error) {
    throw new Error(`Error finding enrollment by ID: ${error.message}`);
  }
};

// Find enrollments by user ID
export const findEnrollmentsByUser = async (userId) => {
  try {
    return await Enrollment.find({ user: userId })
      .populate("course", "number name startDate endDate department credits");
  } catch (error) {
    throw new Error(`Error finding enrollments by user: ${error.message}`);
  }
};

// Find enrollments by course ID
export const findEnrollmentsByCourse = async (courseId) => {
  try {
    return await Enrollment.find({ course: courseId })
      .populate("user", "username firstName lastName email");
  } catch (error) {
    throw new Error(`Error finding enrollments by course: ${error.message}`);
  }
};

// Update enrollment
export const updateEnrollment = async (id, enrollment) => {
  try {
    return await Enrollment.findByIdAndUpdate(id, enrollment, { new: true })
      .populate("user", "username firstName lastName email")
      .populate("course", "number name");
  } catch (error) {
    throw new Error(`Error updating enrollment: ${error.message}`);
  }
};

// Delete enrollment
export const deleteEnrollment = async (id) => {
  try {
    return await Enrollment.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Error deleting enrollment: ${error.message}`);
  }
};

// Check if a user is enrolled in a course
export const isUserEnrolled = async (userId, courseId) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
      status: { $in: ["ACTIVE", "COMPLETED"] }
    });
    return !!enrollment;
  } catch (error) {
    throw new Error(`Error checking enrollment status: ${error.message}`);
  }
};
