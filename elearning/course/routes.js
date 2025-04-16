import express from 'express';
import * as dao from './dao.js';
import { verifyToken, isAdmin, isFacultyOrAdmin } from '../middleware/authMiddleware.js';
import Course from './model.js';
import Enrollment from '../enrollment/model.js';

const router = express.Router();

// Get all courses - available to all authenticated users
router.get('/courses', verifyToken, async (req, res) => {
  try {
    // Make sure we populate the instructor field with name information
    const courses = await Course.find()
      .populate('instructor', 'firstName lastName username email');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get courses by instructor ID - used by faculty
router.get('/courses/instructor/:instructorId', verifyToken, async (req, res) => {
  try {
    // Faculty should only access their own courses
    if (req.userRole === 'FACULTY' && req.userId !== req.params.instructorId) {
      return res.status(403).json({ message: 'Access denied: You can only view your own courses' });
    }
    
    console.log(`Finding courses for instructor: ${req.params.instructorId}`);
    
    const courses = await Course.find({ instructor: req.params.instructorId })
      .populate('instructor', 'firstName lastName username email');
    
    console.log(`Found ${courses.length} courses for instructor`);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get courses by student ID (enrolled courses) - used by students
router.get('/users/:userId/courses', verifyToken, async (req, res) => {
  try {
    // Students should only access their own enrollments
    if (req.userRole === 'STUDENT' && req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied: You can only view your own courses' });
    }
    
    console.log(`Finding enrollments for student: ${req.params.userId}`);
    
    // Find enrollments for this student
    const enrollments = await Enrollment.find({ 
      user: req.params.userId,
      status: { $in: ['ACTIVE', 'COMPLETED'] } 
    });
    
    console.log(`Found ${enrollments.length} enrollments`);
    
    // Extract course IDs from enrollments
    const courseIds = enrollments.map(enrollment => enrollment.course);
    
    console.log(`Course IDs from enrollments: ${courseIds}`);
    
    // Find courses with those IDs
    const courses = await Course.find({ 
      _id: { $in: courseIds } 
    }).populate('instructor', 'firstName lastName username email');
    
    console.log(`Found ${courses.length} courses for student`);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get course by ID
router.get('/courses/:id', verifyToken, async (req, res) => {
  try {
    const course = await dao.findCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create course - Admin or Faculty only
router.post('/courses', verifyToken, isFacultyOrAdmin, async (req, res) => {
  try {
    // If the user is faculty, force the instructor to be themselves
    if (req.userRole === 'FACULTY') {
      req.body.instructor = req.userId;
    }
    
    const newCourse = await dao.createCourse(req.body);
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update course - Admin or course instructor only
router.put('/courses/:id', verifyToken, async (req, res) => {
  try {
    // Check if user can update this course
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Faculty can only update courses they teach
    if (req.userRole === 'FACULTY' && course.instructor.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied: You can only update your own courses' });
    }
    
    // Students cannot update courses
    if (req.userRole === 'STUDENT') {
      return res.status(403).json({ message: 'Access denied: Students cannot update courses' });
    }
    
    // If the user is faculty, ensure they cannot change the instructor
    if (req.userRole === 'FACULTY') {
      req.body.instructor = req.userId;
    }
    
    const updatedCourse = await dao.updateCourse(req.params.id, req.body);
    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(updatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete course - Admin only
router.delete('/courses/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedCourse = await dao.deleteCourse(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    // Check for specific error that might indicate the course has enrollments
    if (error.name === 'MongoServerError') {
      return res.status(400).json({
        message: 'Cannot delete course with existing enrollments. Remove enrollments first.'
      });
    }
    res.status(500).json({ message: error.message });
  }
});

export default router;
