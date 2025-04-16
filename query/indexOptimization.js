import mongoose from 'mongoose';
import User from '../user/model.js';
import Course from '../course/model.js';
import Assignment from '../assignment/model.js';
import Quiz from '../quiz/model.js';
import Enrollment from '../enrollment/model.js';

/**
 * This module creates indexes for optimizing query performance in the e-learning application.
 * Each index is designed to improve specific query patterns identified in the application.
 */
const indexOptimization = {
  /**
   * Create all necessary indexes for the application
   * This should be called during application startup
   */
  async createAllIndexes() {
    try {
      console.log('Creating database indexes...');
      
      // Index 1: Optimize user lookup by role
      // This improves queries that filter users by role (e.g., finding all students or faculty)
      await User.collection.createIndex({ role: 1 });
      console.log('Created index on User.role');
      
      // Index 2: Optimize course queries by department and instructor
      // This improves course filtering by department and instructor assignment queries
      await Course.collection.createIndex({ department: 1, instructor: 1 });
      console.log('Created composite index on Course.department and Course.instructor');
      
      // Index 3: Optimize enrollment queries by user and status
      // This improves queries that find all active enrollments for a specific user
      await Enrollment.collection.createIndex({ user: 1, status: 1 });
      console.log('Created composite index on Enrollment.user and Enrollment.status');
      
      // Index 4: Optimize enrollment queries by course
      // This improves queries that find all students enrolled in a specific course
      await Enrollment.collection.createIndex({ course: 1, status: 1 });
      console.log('Created composite index on Enrollment.course and Enrollment.status');
      
      // Index 5: Optimize assignment queries by course number and due date
      // This improves queries that find upcoming assignments for a course
      await Assignment.collection.createIndex({ course_number: 1, dueDate: 1 });
      console.log('Created composite index on Assignment.course_number and Assignment.dueDate');
      
      // Index 6: Text index for course search functionality
      // This enables efficient text search across course name and description
      await Course.collection.createIndex(
        { name: "text", description: "text" },
        { weights: { name: 10, description: 5 } }
      );
      console.log('Created text index on Course.name and Course.description');
      
      console.log('All indexes created successfully');
    } catch (error) {
      console.error('Error creating indexes:', error);
      throw error;
    }
  },
  
  /**
   * Benchmark specific queries to compare performance before and after indexing
   * @returns {Object} Performance comparison results
   */
  async runPerformanceBenchmarks() {
    const benchmarkResults = {};
    
    try {
      console.log('Running query performance benchmarks...');
      
      // Benchmark 1: Finding users by role (students)
      benchmarkResults.findStudents = await benchmarkQuery(
        'Find all students',
        async () => {
          return await User.find({ role: 'STUDENT' }).lean();
        }
      );
      
      // Benchmark 2: Finding active enrollments for a specific course
      // Get a sample course ID first
      const sampleCourse = await Course.findOne().lean();
      if (sampleCourse) {
        benchmarkResults.findCourseEnrollments = await benchmarkQuery(
          'Find enrollments for a specific course',
          async () => {
            return await Enrollment.find({ 
              course: sampleCourse._id,
              status: 'ACTIVE'
            }).lean();
          }
        );
      }
      
      // Benchmark 3: Finding upcoming assignments for a course
      const sampleCourseNumber = await Course.findOne().lean().then(c => c?.number);
      if (sampleCourseNumber) {
        benchmarkResults.findUpcomingAssignments = await benchmarkQuery(
          'Find upcoming assignments for a course',
          async () => {
            const now = new Date();
            return await Assignment.find({
              course_number: sampleCourseNumber,
              dueDate: { $gt: now },
              releasedOrNot: true
            }).lean();
          }
        );
      }
      
      console.log('Benchmark results:', benchmarkResults);
      return benchmarkResults;
      
    } catch (error) {
      console.error('Error running benchmarks:', error);
      throw error;
    }
  },
  
  /**
   * Run explain plans for key queries to analyze execution
   * @returns {Object} Explain plan results
   */
  async generateExplainPlans() {
    const explainResults = {};
    
    try {
      console.log('Generating query explain plans...');
      
      // Explain 1: Finding users by role
      explainResults.findStudentsExplain = await User.find({ 
        role: 'STUDENT' 
      }).explain('executionStats');
      
      // Explain 2: Finding active enrollments for a course
      const sampleCourse = await Course.findOne().lean();
      if (sampleCourse) {
        explainResults.courseEnrollmentsExplain = await Enrollment.find({ 
          course: sampleCourse._id,
          status: 'ACTIVE'
        }).explain('executionStats');
      }
      
      // Explain 3: Finding upcoming assignments
      const sampleCourseNumber = await Course.findOne().lean().then(c => c?.number);
      if (sampleCourseNumber) {
        explainResults.upcomingAssignmentsExplain = await Assignment.find({
          course_number: sampleCourseNumber,
          dueDate: { $gt: new Date() },
          releasedOrNot: true
        }).explain('executionStats');
      }
      
      return explainResults;
      
    } catch (error) {
      console.error('Error generating explain plans:', error);
      throw error;
    }
  }
};

/**
 * Helper function to benchmark a query function's performance
 * @param {string} description - Description of the query
 * @param {Function} queryFn - The query function to benchmark
 * @returns {Object} Benchmark results including execution time and document count
 */
async function benchmarkQuery(description, queryFn) {
  console.log(`Running benchmark: ${description}`);
  
  // Run the query once to warm up any caches
  await queryFn();
  
  // Run the actual benchmark
  const startTime = process.hrtime();
  const results = await queryFn();
  const endTime = process.hrtime(startTime);
  
  // Calculate execution time in milliseconds
  const executionTimeMs = (endTime[0] * 1000) + (endTime[1] / 1000000);
  
  console.log(`  Results: Found ${Array.isArray(results) ? results.length : 0} documents in ${executionTimeMs.toFixed(2)}ms`);
  
  return {
    description,
    documentCount: Array.isArray(results) ? results.length : 0,
    executionTimeMs,
    timestamp: new Date()
  };
}

export default indexOptimization;
