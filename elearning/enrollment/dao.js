import Enrollment from "./model.js";
import { withTransaction } from "../utils/transactionUtils.js";
import mongoose from "mongoose";

// Create a new enrollment with transaction support
export const createEnrollment = async (enrollmentData) => {
  try {
    // Use the withTransaction utility to wrap the operation in a transaction
    return await withTransaction(async (session) => {
      // Check if enrollment already exists to prevent duplicates
      const existingEnrollment = await Enrollment.findOne({
        user: enrollmentData.user,
        course: enrollmentData.course
      }).session(session);

      if (existingEnrollment) {
        throw new Error("Student is already enrolled in this course");
      }

      // Create new enrollment within the transaction
      const newEnrollment = new Enrollment(enrollmentData);
      const savedEnrollment = await newEnrollment.save({ session });

      // Return the new enrollment with populated fields
      return await Enrollment.findById(savedEnrollment._id)
        .populate("user", "username firstName lastName email")
        .populate("course", "number name")
        .session(session);
    });
  } catch (error) {
    // This error is already wrapped by withTransaction
    throw error;
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

// Update enrollment with transaction support
export const updateEnrollment = async (id, enrollmentData) => {
  try {
    return await withTransaction(async (session) => {
      // Check if the enrollment exists
      const enrollment = await Enrollment.findById(id).session(session);
      
      if (!enrollment) {
        throw new Error("Enrollment not found");
      }
      
      // Perform update operation within transaction
      const updatedEnrollment = await Enrollment.findByIdAndUpdate(
        id, 
        enrollmentData, 
        { new: true, session }
      )
      .populate("user", "username firstName lastName email")
      .populate("course", "number name")
      .session(session);
      
      return updatedEnrollment;
    });
  } catch (error) {
    throw error;
  }
};

// Delete enrollment with transaction support
export const deleteEnrollment = async (id) => {
  try {
    return await withTransaction(async (session) => {
      // Check if the enrollment exists
      const enrollment = await Enrollment.findById(id).session(session);
      
      if (!enrollment) {
        throw new Error("Enrollment not found");
      }
      
      // Delete the enrollment within the transaction
      return await Enrollment.findByIdAndDelete(id).session(session);
    });
  } catch (error) {
    throw error;
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

// Bulk enrollment with transaction support (demonstrating more complex transaction)
export const bulkEnrollStudents = async (courseId, userIds) => {
  try {
    return await withTransaction(async (session) => {
      const results = {
        successful: [],
        failed: []
      };
      
      // Process each user enrollment attempt
      for (const userId of userIds) {
        try {
          // Check if enrollment already exists
          const existingEnrollment = await Enrollment.findOne({
            user: userId,
            course: courseId
          }).session(session);
          
          if (existingEnrollment) {
            results.failed.push({
              userId,
              reason: "Already enrolled"
            });
            continue;
          }
          
          // Create new enrollment
          const newEnrollment = new Enrollment({
            user: userId,
            course: courseId,
            enrollmentDate: new Date(),
            status: "ACTIVE"
          });
          
          // Save the enrollment within the transaction
          await newEnrollment.save({ session });
          results.successful.push(userId);
          
        } catch (error) {
          // Individual enrollment failures don't fail the entire transaction
          results.failed.push({
            userId,
            reason: error.message
          });
        }
      }
      
      // If no enrollments were successful, throw an error to trigger rollback
      if (results.successful.length === 0 && userIds.length > 0) {
        throw new Error("All enrollments failed");
      }
      
      return results;
    });
  } catch (error) {
    throw error;
  }
};
