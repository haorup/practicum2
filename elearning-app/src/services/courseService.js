import api from './api';

// Get all courses (Admin)
export const getCourses = () => api.get('/courses');

// Get courses where user is the instructor (Faculty)
export const getCoursesByInstructor = (instructorId) => {
  console.log(`Fetching courses for instructor: ${instructorId}`);
  return api.get(`/courses/instructor/${instructorId}`);
};

// Get courses where user is enrolled (Student)
export const getCoursesByStudent = (studentId) => {
  console.log(`Fetching courses for student: ${studentId}`);
  return api.get(`/users/${studentId}/courses`);
};

// Get a specific course
export const getCourse = (id) => api.get(`/courses/${id}`);

// Create a new course (Admin and Faculty)
export const createCourse = (course) => api.post('/courses', course);

// Update a course (Admin and course owner)
export const updateCourse = (id, course) => api.put(`/courses/${id}`, course);

// Delete a course (Admin only)
export const deleteCourse = (id) => api.delete(`/courses/${id}`);
