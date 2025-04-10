import mongoose from "mongoose";
import { withTransaction } from "./transactionUtils.js";
import Enrollment from "../enrollment/model.js";
import User from "../user/model.js";
import Course from "../course/model.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path to .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Log to debug if environment variable is loaded
console.log("MONGODB_URI available:", process.env.MONGODB_URI ? "Yes" : "No");

/**
 * Demonstrates a successful transaction across multiple operations
 */
export const demonstrateSuccessfulTransaction = async () => {
  try {
    console.log("Starting successful transaction demonstration...");
    
    const result = await withTransaction(async (session) => {
      // 1. Create a test user
      const testUser = new User({
        username: "test_transaction_user",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        email: "test@transaction.com",
        userID: 99999,
        role: "STUDENT"
      });
      await testUser.save({ session });
      
      // 2. Create a test course
      const testCourse = new Course({
        name: "Transaction Test Course",
        number: "TRX101",
        term: "2025 FA",
        department: "CS",
        credits: 3
      });
      await testCourse.save({ session });
      
      // 3. Create an enrollment
      const testEnrollment = new Enrollment({
        user: testUser._id,
        course: testCourse._id,
        enrollmentDate: new Date(),
        status: "ACTIVE"
      });
      await testEnrollment.save({ session });
      
      return {
        user: testUser,
        course: testCourse,
        enrollment: testEnrollment
      };
    });
    
    console.log("Transaction successful!", result);
    return result;
  } catch (error) {
    console.error("Transaction demonstration failed:", error);
    throw error;
  }
};

/**
 * Demonstrates a failed transaction with rollback
 */
export const demonstrateFailedTransaction = async () => {
  try {
    console.log("Starting failed transaction demonstration...");
    
    await withTransaction(async (session) => {
      // 1. Create a test user
      const testUser = new User({
        username: "rollback_test_user",
        password: "password123",
        firstName: "Rollback",
        lastName: "User",
        email: "rollback@transaction.com",
        userID: 99998,
        role: "STUDENT"
      });
      await testUser.save({ session });
      
      // 2. Create a test course
      const testCourse = new Course({
        name: "Rollback Test Course",
        number: "TRX102",
        term: "2025 FA",
        department: "CS",
        credits: 3
      });
      await testCourse.save({ session });
      
      // 3. Create an enrollment with invalid data to cause failure
      const testEnrollment = new Enrollment({
        user: testUser._id,
        course: testCourse._id,
        enrollmentDate: new Date(),
        // Intentionally use an invalid status to cause validation error
        status: "INVALID_STATUS"
      });
      await testEnrollment.save({ session });
      
      return "This should not be returned due to rollback";
    });
  } catch (error) {
    console.log("Transaction failed as expected with rollback:", error.message);
    
    // Verify rollback by checking if the user and course were not saved
    const user = await User.findOne({ username: "rollback_test_user" });
    const course = await Course.findOne({ number: "TRX102" });
    
    console.log("User was rolled back:", user === null);
    console.log("Course was rolled back:", course === null);
    
    return {
      rolledBack: true,
      userExists: user !== null,
      courseExists: course !== null
    };
  }
};

/**
 * Demonstrates a complex transaction that handles bulk enrollment with partial success
 * @param {string} courseId - The ID of the course to enroll students in
 * @param {string[]} userIds - Array of user IDs to enroll
 * @returns {Object} Results of the bulk enrollment operation
 */
export const bulkEnrollStudents = async (courseId, userIds) => {
  try {
    return await withTransaction(async (session) => {
      const results = {
        successful: [],
        failed: []
      };
      
      // Verify the course exists
      const course = await Course.findById(courseId).session(session);
      if (!course) {
        throw new Error(`Course with ID ${courseId} does not exist`);
      }
      
      for (const userId of userIds) {
        try {
          // Check if the user exists
          const user = await User.findById(userId).session(session);
          if (!user) {
            throw new Error(`User with ID ${userId} does not exist`);
          }
          
          // Check for existing enrollment
          const existingEnrollment = await Enrollment.findOne({
            user: userId,
            course: courseId
          }).session(session);
          
          if (existingEnrollment) {
            throw new Error(`User ${userId} is already enrolled in course ${courseId}`);
          }
          
          // Create enrollment if no existing enrollment found
          const newEnrollment = new Enrollment({
            user: userId,
            course: courseId,
            enrollmentDate: new Date(),
            status: "ACTIVE"
          });
          
          const savedEnrollment = await newEnrollment.save({ session });
          
          // Record success
          results.successful.push({
            userId,
            enrollmentId: savedEnrollment._id
          });
        } catch (error) {
          // Record individual failure without failing entire transaction
          results.failed.push({
            userId,
            reason: error.message
          });
        }
      }
      
      // Only roll back if nothing succeeded
      if (results.successful.length === 0 && userIds.length > 0) {
        throw new Error("All enrollments failed");
      }
      
      return results;
    });
  } catch (error) {
    console.error("Bulk enrollment failed:", error);
    throw error;
  }
};

/**
 * Demonstrates the bulk enrollment functionality
 */
export const demonstrateBulkEnrollment = async () => {
  try {
    console.log("Starting bulk enrollment demonstration...");
    
    // First create a test course
    const testCourse = new Course({
      name: "Bulk Enrollment Test Course",
      number: "TRX201",
      term: "2025 FA",
      department: "CS",
      credits: 3
    });
    await testCourse.save();
    
    // Create a few test users
    const testUsers = [];
    for (let i = 1; i <= 5; i++) {
      const user = new User({
        username: `bulk_user_${i}`,
        password: "password123",
        firstName: `Bulk${i}`,
        lastName: "User",
        email: `bulk${i}@test.com`,
        userID: 88000 + i,
        role: "STUDENT"
      });
      const savedUser = await user.save();
      testUsers.push(savedUser);
    }
    
    // Create an invalid user ID for testing partial failure
    const validUserIds = testUsers.map(user => user._id);
    const invalidUserId = new mongoose.Types.ObjectId();
    
    // Run bulk enrollment with mixed valid/invalid users
    const userIdsToEnroll = [...validUserIds, invalidUserId];
    console.log(`Attempting to enroll ${userIdsToEnroll.length} users (${validUserIds.length} valid, 1 invalid)`);
    
    const results = await bulkEnrollStudents(testCourse._id, userIdsToEnroll);
    
    console.log("Bulk enrollment results:", {
      successful: results.successful.length,
      failed: results.failed.length,
      details: results
    });
    
    return results;
  } catch (error) {
    console.error("Bulk enrollment demonstration failed:", error);
    throw error;
  }
};

// Add the bulk enrollment demo to the run function
export const runTransactionDemos = async () => {
  // Setup MongoDB connection if needed
  if (mongoose.connection.readyState !== 1) {
    // Use environment variable with fallback
    const atlasUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/elearning';
    
    if (!atlasUri) {
      console.error("MongoDB URI is not defined! Check your .env file.");
      process.exit(1);
    }
    
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(atlasUri);
    console.log("Connected to MongoDB Atlas");
  }
  
  try {
    console.log("=== TRANSACTION DEMONSTRATIONS ===");
    
    // Run successful transaction demo
    console.log("\n1. SUCCESSFUL TRANSACTION DEMO:");
    const successResult = await demonstrateSuccessfulTransaction();
    console.log("Successful transaction result:", successResult);
    
    // Run failed transaction demo
    console.log("\n2. FAILED TRANSACTION WITH ROLLBACK DEMO:");
    const failureResult = await demonstrateFailedTransaction();
    console.log("Failed transaction result:", failureResult);
    
    // Run bulk enrollment demonstration 
    console.log("\n3. COMPLEX TRANSACTION WITH PARTIAL SUCCESS DEMO:");
    const bulkResult = await demonstrateBulkEnrollment();
    console.log("Bulk enrollment result summary:", {
      successful: bulkResult.successful.length,
      failed: bulkResult.failed.length
    });
    
    console.log("\n=== DEMONSTRATIONS COMPLETE ===");
  } catch (error) {
    console.error("Error running demos:", error);
  } finally {
    // Cleanup if this is a standalone script
    if (process.env.NODE_ENV !== 'production') {
      // await mongoose.disconnect();
    }
  }
};

// Before running this script directly, make sure to set your MongoDB URI
// You can either set the MONGODB_URI environment variable or replace the connection string above
runTransactionDemos().catch(console.error);
