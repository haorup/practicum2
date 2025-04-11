import mongoose from 'mongoose';
import User from '../user/model.js';
import Course from '../course/model.js';
import Assignment from '../assignment/model.js';
import Quiz from '../quiz/model.js';
import Enrollment from '../enrollment/model.js';

const advancedQueries = {
  /**
   * Query 1: Course Enrollment Statistics
   * 
   * This aggregation provides a comprehensive view of enrollment statistics for each course,
   * including the count of active students, their average activity time, and a breakdown
   * of enrollment status.
   * 
   * Business value: Helps administrators and instructors understand course popularity,
   * student engagement, and enrollment trends across the platform.
   */
  async getCourseEnrollmentStatistics() {
    try {
      const result = await Enrollment.aggregate([
        // Stage 1: Group enrollments by course
        {
          $group: {
            _id: "$course",
            totalEnrollments: { $sum: 1 },
            activeEnrollments: {
              $sum: {
                $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0]
              }
            },
            completedEnrollments: {
              $sum: {
                $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0]
              }
            },
            droppedEnrollments: {
              $sum: {
                $cond: [{ $eq: ["$status", "DROPPED"] }, 1, 0]
              }
            },
            pendingEnrollments: {
              $sum: {
                $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0]
              }
            }
          }
        },
        // Stage 2: Look up course details
        {
          $lookup: {
            from: "course",
            localField: "_id",
            foreignField: "_id",
            as: "courseDetails"
          }
        },
        // Stage 3: Unwind the courseDetails array
        {
          $unwind: "$courseDetails"
        },
        // Stage 4: Project the final result with formatted fields
        {
          $project: {
            _id: 0,
            courseId: "$_id",
            courseName: "$courseDetails.name",
            courseNumber: "$courseDetails.number",
            department: "$courseDetails.department",
            term: "$courseDetails.term",
            totalEnrollments: 1,
            activeEnrollments: 1,
            completedEnrollments: 1,
            droppedEnrollments: 1,
            pendingEnrollments: 1,
            activePercentage: {
              $multiply: [
                { $divide: ["$activeEnrollments", "$totalEnrollments"] },
                100
              ]
            }
          }
        },
        // Stage 5: Sort by total enrollments (descending)
        {
          $sort: { totalEnrollments: -1 }
        }
      ]);

      return result;
    } catch (error) {
      console.error('Error in getCourseEnrollmentStatistics:', error);
      throw error;
    }
  },

  /**
   * Query 2: Instructor Course Load
   * 
   * This aggregation calculates the teaching load for each instructor,
   * including the number of courses taught, total credits, and student count.
   * 
   * Business value: Helps administrators assess faculty workload, ensure fair 
   * distribution of teaching responsibilities, and plan resource allocation.
   */
  async getInstructorCourseLoad() {
    try {
      const result = await Course.aggregate([
        // Stage 1: Match only courses with valid instructors
        {
          $match: {
            instructor: { $ne: null }
          }
        },
        // Stage 2: Group by instructor
        {
          $group: {
            _id: "$instructor",
            coursesCount: { $sum: 1 },
            totalCredits: { $sum: "$credits" },
            courses: { 
              $push: { 
                courseId: "$_id",
                courseName: "$name", 
                courseNumber: "$number",
                credits: "$credits",
                term: "$term"
              } 
            }
          }
        },
        // Stage 3: Look up instructor details
        {
          $lookup: {
            from: "user",
            localField: "_id",
            foreignField: "_id",
            as: "instructorDetails"
          }
        },
        // Stage 4: Unwind the instructorDetails array
        {
          $unwind: "$instructorDetails"
        },
        // Stage 5: Look up enrollments for each instructor's courses
        {
          $lookup: {
            from: "enrollment",
            let: { instructor_id: "$_id" },
            pipeline: [
              {
                $lookup: {
                  from: "course",
                  localField: "course",
                  foreignField: "_id",
                  as: "courseInfo"
                }
              },
              { $unwind: "$courseInfo" },
              {
                $match: {
                  $expr: {
                    $eq: ["$courseInfo.instructor", "$$instructor_id"]
                  },
                  status: "ACTIVE"
                }
              }
            ],
            as: "enrollments"
          }
        },
        // Stage 6: Project the final result
        {
          $project: {
            _id: 0,
            instructorId: "$_id",
            instructorName: {
              $concat: ["$instructorDetails.firstName", " ", "$instructorDetails.lastName"]
            },
            email: "$instructorDetails.email",
            coursesCount: 1,
            totalCredits: 1,
            totalStudents: { $size: "$enrollments" },
            courses: 1
          }
        },
        // Stage 7: Sort by course count (descending)
        {
          $sort: { coursesCount: -1 }
        }
      ]);

      return result;
    } catch (error) {
      console.error('Error in getInstructorCourseLoad:', error);
      throw error;
    }
  },

  /**
   * Query 3: Student Performance Analytics
   * 
   * This aggregation analyzes student performance across courses,
   * including assignment completion, quiz scores, and overall engagement.
   * 
   * Business value: Helps identify struggling students, recognize high performers,
   * and provide targeted support for improved learning outcomes.
   */
  async getStudentPerformanceAnalytics() {
    try {
      // First, get all student enrollments with course data
      const result = await Enrollment.aggregate([
        // Stage 1: Match only active enrollments
        {
          $match: {
            status: "ACTIVE"
          }
        },
        // Stage 2: Look up user details
        {
          $lookup: {
            from: "user",
            localField: "user",
            foreignField: "_id",
            as: "studentDetails"
          }
        },
        // Stage 3: Unwind the studentDetails array
        {
          $unwind: "$studentDetails"
        },
        // Stage 4: Look up course details
        {
          $lookup: {
            from: "course",
            localField: "course",
            foreignField: "_id",
            as: "courseDetails"
          }
        },
        // Stage 5: Unwind the courseDetails array
        {
          $unwind: "$courseDetails"
        },
        // Stage 6: Group by student
        {
          $group: {
            _id: "$user",
            studentName: { 
              $first: {
                $concat: ["$studentDetails.firstName", " ", "$studentDetails.lastName"]
              }
            },
            email: { $first: "$studentDetails.email" },
            coursesEnrolled: { $sum: 1 },
            totalCredits: { $sum: "$courseDetails.credits" },
            courses: {
              $push: {
                courseId: "$courseDetails._id",
                courseName: "$courseDetails.name",
                courseNumber: "$courseDetails.number",
                term: "$courseDetails.term",
                enrollmentStatus: "$status",
                enrollmentDate: "$enrollmentDate"
              }
            },
            lastActivity: { $max: "$lastActivity" }
          }
        },
        // Stage 7: Add fields for calculated engagement metrics
        {
          $addFields: {
            daysActive: {
              $divide: [
                { $subtract: [new Date(), "$lastActivity"] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        // Stage 8: Project final result
        {
          $project: {
            _id: 0,
            studentId: "$_id",
            studentName: 1,
            email: 1,
            coursesEnrolled: 1,
            totalCredits: 1,
            courses: 1,
            lastActivity: 1,
            daysActive: 1,
            engagementScore: {
              $cond: {
                if: { $lt: ["$daysActive", 7] },
                then: "High",
                else: {
                  $cond: {
                    if: { $lt: ["$daysActive", 14] },
                    then: "Medium",
                    else: "Low"
                  }
                }
              }
            }
          }
        },
        // Stage 9: Sort by enrollment count (descending)
        {
          $sort: { coursesEnrolled: -1 }
        }
      ]);

      return result;
    } catch (error) {
      console.error('Error in getStudentPerformanceAnalytics:', error);
      throw error;
    }
  },

  /**
   * Query 4: Course Content Analysis
   * 
   * This aggregation analyzes the content structure of courses,
   * including lesson counts, assignment distribution, and quiz complexity.
   * 
   * Business value: Helps instructors balance course workload, identify content gaps,
   * and ensure comprehensive coverage of subject matter.
   */
  async getCourseContentAnalysis() {
    try {
      // Get course details with assignments and quizzes
      const result = await Course.aggregate([
        // Stage 1: Project initial course data
        {
          $project: {
            _id: 1,
            name: 1,
            number: 1,
            term: 1,
            department: 1,
            credits: 1,
            lessonCount: { $size: { $ifNull: ["$lessons", []] } }
          }
        },
        // Stage 2: Look up assignments for this course
        {
          $lookup: {
            from: "assignment",
            let: { course_number: "$number" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$course_number", "$$course_number"]
                  }
                }
              }
            ],
            as: "assignments"
          }
        },
        // Stage 3: Look up quizzes for this course
        {
          $lookup: {
            from: "quiz",
            let: { course_number: "$number" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$courses", "$$course_number"]
                  }
                }
              }
            ],
            as: "quizzes"
          }
        },
        // Stage 4: Add calculated fields
        {
          $addFields: {
            assignmentCount: { $size: "$assignments" },
            quizCount: { $size: "$quizzes" },
            totalAssignmentPoints: { $sum: "$assignments.points" },
            assignmentTypes: {
              released: {
                $size: {
                  $filter: {
                    input: "$assignments",
                    as: "assignment",
                    cond: { $eq: ["$$assignment.releasedOrNot", true] }
                  }
                }
              },
              upcoming: {
                $size: {
                  $filter: {
                    input: "$assignments",
                    as: "assignment",
                    cond: { $eq: ["$$assignment.releasedOrNot", false] }
                  }
                }
              }
            },
            quizTypes: {
              exams: {
                $size: {
                  $filter: {
                    input: "$quizzes",
                    as: "quiz",
                    cond: { $eq: ["$$quiz.assignmentGroup", "EXAMS"] }
                  }
                }
              },
              quizzes: {
                $size: {
                  $filter: {
                    input: "$quizzes",
                    as: "quiz",
                    cond: { $eq: ["$$quiz.assignmentGroup", "QUIZZES"] }
                  }
                }
              }
            }
          }
        },
        // Stage 5: Project final result
        {
          $project: {
            _id: 0,
            courseId: "$_id",
            name: 1,
            number: 1,
            term: 1,
            department: 1,
            credits: 1,
            contentSummary: {
              lessonCount: "$lessonCount",
              assignmentCount: "$assignmentCount",
              quizCount: "$quizCount"
            },
            assignmentAnalysis: {
              totalPoints: "$totalAssignmentPoints",
              releasedCount: "$assignmentTypes.released",
              upcomingCount: "$assignmentTypes.upcoming"
            },
            quizAnalysis: {
              examCount: "$quizTypes.exams",
              quizCount: "$quizTypes.quizzes"
            },
            contentDensity: {
              $divide: [
                { $add: ["$lessonCount", "$assignmentCount", "$quizCount"] },
                "$credits"
              ]
            }
          }
        },
        // Stage 6: Sort by content density (descending)
        {
          $sort: { "contentDensity": -1 }
        }
      ]);

      return result;
    } catch (error) {
      console.error('Error in getCourseContentAnalysis:', error);
      throw error;
    }
  },

  /**
   * Query 5: Department Analytics
   * 
   * This aggregation provides insights into department-level metrics,
   * including course offerings, student enrollment, and faculty distribution.
   * 
   * Business value: Helps administrators understand department performance,
   * resource allocation efficiency, and identify growth opportunities.
   */
  async getDepartmentAnalytics() {
    try {
      const result = await Course.aggregate([
        // Stage 1: Group by department
        {
          $group: {
            _id: "$department",
            courseCount: { $sum: 1 },
            totalCredits: { $sum: "$credits" },
            courses: {
              $push: {
                courseId: "$_id",
                name: "$name",
                number: "$number",
                credits: "$credits"
              }
            },
            instructors: { $addToSet: "$instructor" }
          }
        },
        // Stage 2: Look up enrollments for each department
        {
          $lookup: {
            from: "enrollment",
            let: { dept_courses: "$courses.courseId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$course", "$$dept_courses"]
                  },
                  status: "ACTIVE"
                }
              }
            ],
            as: "enrollments"
          }
        },
        // Stage 3: Add calculated fields
        {
          $addFields: {
            studentCount: { $size: "$enrollments" },
            instructorCount: { $size: "$instructors" },
            avgCoursesPerInstructor: {
              $cond: [
                { $eq: [{ $size: "$instructors" }, 0] },
                0,
                { $divide: ["$courseCount", { $size: "$instructors" }] }
              ]
            },
            avgStudentsPerCourse: {
              $cond: [
                { $eq: ["$courseCount", 0] },
                0,
                { $divide: [{ $size: "$enrollments" }, "$courseCount"] }
              ]
            }
          }
        },
        // Stage 4: Project final result
        {
          $project: {
            _id: 0,
            department: "$_id",
            courseCount: 1,
            totalCredits: 1,
            studentCount: 1,
            instructorCount: 1,
            avgCoursesPerInstructor: 1,
            avgStudentsPerCourse: 1,
            studentToFacultyRatio: {
              $cond: [
                { $eq: ["$instructorCount", 0] },
                "N/A",
                { $divide: ["$studentCount", "$instructorCount"] }
              ]
            }
          }
        },
        // Stage 5: Sort by student count (descending)
        {
          $sort: { studentCount: -1 }
        }
      ]);

      return result;
    } catch (error) {
      console.error('Error in getDepartmentAnalytics:', error);
      throw error;
    }
  }
};

export default advancedQueries;