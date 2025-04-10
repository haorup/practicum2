import mongoose from "mongoose";
import { withTransaction } from "./transactionUtils.js";
import Enrollment from "../enrollment/model.js";
import User from "../user/model.js";
import Course from "../course/model.js";

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
 * Run both demonstrations
 */
export const runTransactionDemos = async () => {
  // Setup MongoDB connection if needed
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect('mongodb://localhost:27017/elearning');
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


// runTransactionDemos().catch(console.error);
