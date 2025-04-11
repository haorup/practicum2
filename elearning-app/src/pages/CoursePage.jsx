import { useState, useEffect } from 'react'
import { getCourses, createCourse, updateCourse, deleteCourse, getCoursesByInstructor, getCoursesByStudent } from '../services/courseService'
import { getUsers } from '../services/userService'
import { useUser } from '../context/UserContext'
import '../styles/EnrollmentPage.css' // Reuse the same styles for role badges
import { useNavigate } from 'react-router-dom'
import '../styles/QuizPage.css' // Import for view-button class

function CoursePage() {
  const [courses, setCourses] = useState([])
  const [currentCourse, setCurrentCourse] = useState({
    name: '',
    number: '',
    description: '',
    instructor: '',
    credits: 3,
    department: '',
    term: ''
  })
  const [editing, setEditing] = useState(false)
  const [users, setUsers] = useState([])
  const { user: currentUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      console.log('Current user in CoursePage:', currentUser);
      fetchCoursesByRole();
      // Only fetch users list if admin or faculty
      if (currentUser.role === 'ADMIN' || currentUser.role === 'FACULTY') {
        fetchUsers();
      }
    }
  }, [currentUser])

  const fetchCoursesByRole = async () => {
    try {
      let response;
      
      console.log(`Fetching courses for ${currentUser.role} with ID ${currentUser.id}`);
      
      // Different fetch strategy based on user role
      if (currentUser.role === 'ADMIN') {
        // Admins see all courses
        response = await getCourses();
      } else if (currentUser.role === 'FACULTY') {
        // Faculty see courses they teach
        response = await getCoursesByInstructor(currentUser.id);
      } else {
        // Students see courses they're enrolled in
        response = await getCoursesByStudent(currentUser.id);
      }
      
      console.log('Courses response:', response.data);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      // Filter for faculty members only for instructors
      const facultyMembers = response.data.filter(user => 
        user.role === 'FACULTY' || user.role === 'ADMIN'
      );
      setUsers(facultyMembers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCourse({ ...currentCourse, [name]: value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only allow ADMIN or FACULTY to create/update courses
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'FACULTY') {
      alert('You do not have permission to perform this action.');
      return;
    }
    
    // Faculty can only create courses with themselves as instructor
    if (currentUser.role === 'FACULTY' && currentCourse.instructor !== currentUser.id) {
      setCurrentCourse({...currentCourse, instructor: currentUser.id});
    }
    
    try {
      if (editing) {
        await updateCourse(currentCourse._id, currentCourse);
      } else {
        await createCourse(currentCourse);
      }
      
      resetCourseForm();
      fetchCoursesByRole();
    } catch (error) {
      console.error('Error saving course:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  }

  const resetCourseForm = () => {
    setCurrentCourse({
      name: '',
      number: '',
      description: '',
      instructor: currentUser.role === 'FACULTY' ? currentUser.id : '',
      credits: 3,
      department: '',
      term: ''
    });
    setEditing(false);
  }

  const handleEdit = (course) => {
    // Only allow ADMIN or course instructor to edit courses
    if (currentUser.role !== 'ADMIN' && course.instructor._id !== currentUser.id) {
      alert('You do not have permission to perform this action.');
      return;
    }
    
    // Create a copy of the course to modify
    const courseToEdit = { ...course };
    
    // Make sure we use the instructor ID, not the object
    if (typeof courseToEdit.instructor === 'object' && courseToEdit.instructor !== null) {
      courseToEdit.instructor = courseToEdit.instructor._id;
    }
    
    setCurrentCourse(courseToEdit);
    setEditing(true);
  }

  const handleDelete = async (id) => {
    // Only allow ADMIN to delete courses
    if (currentUser.role !== 'ADMIN') {
      alert('You do not have permission to perform this action.');
      return;
    }
    
    try {
      await deleteCourse(id);
      fetchCoursesByRole();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  }

  const handleViewQuizzes = (courseNumber) => {
    navigate(`/quizzes/${courseNumber}`);
  }

  const handleViewAssignments = (courseNumber) => {
    navigate(`/assignments/${courseNumber}`);
  }

  // Determine if the user can modify courses (ADMIN or FACULTY)
  const canModifyCourses = currentUser && 
    (currentUser.role === 'ADMIN' || currentUser.role === 'FACULTY');
  
  // Only admins can delete courses
  const canDeleteCourses = currentUser && currentUser.role === 'ADMIN';

  return (
    <div className="page-container">
      <h2>Courses</h2>
      
      {/* Display different messages based on role */}
      <div className="role-indicator">
        {currentUser && currentUser.role === 'ADMIN' && <p className="role-badge admin">Administrator View (Full Access)</p>}
        {currentUser && currentUser.role === 'FACULTY' && <p className="role-badge faculty">Faculty View (Your Courses Only)</p>}
        {currentUser && currentUser.role === 'STUDENT' && <p className="role-badge student">Student View (Enrolled Courses Only)</p>}
      </div>
      
      {/* Only show the form to ADMIN and FACULTY users */}
      {canModifyCourses && (
        <form onSubmit={handleSubmit} className="form">
          <h3>{editing ? 'Edit Course' : 'Add New Course'}</h3>
          
          <div className="form-group">
            <label>Course Name</label>
            <input
              type="text"
              name="name"
              value={currentCourse.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Course Number</label>
            <input
              type="text"
              name="number"
              value={currentCourse.number}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={currentCourse.description}
              onChange={handleInputChange}
            />
          </div>
          
          {/* Only show instructor selector to admins */}
          {currentUser.role === 'ADMIN' && (
            <div className="form-group">
              <label>Instructor</label>
              <select
                name="instructor"
                value={currentCourse.instructor}
                onChange={handleInputChange}
                required
              >
                <option value="">Select an instructor</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName + " " + user.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="form-group">
            <label>Credits</label>
            <input
              type="number"
              name="credits"
              value={currentCourse.credits}
              onChange={handleInputChange}
              min="1"
              max="6"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={currentCourse.department}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Term</label>
            <input
              type="text"
              name="term"
              value={currentCourse.term}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <button type="submit">{editing ? 'Update' : 'Create'}</button>
          {editing && (
            <button type="button" onClick={resetCourseForm}>Cancel</button>
          )}
        </form>
      )}

      <div className="list-container">
        <h3>
          {currentUser && currentUser.role === 'STUDENT' && 'My Courses'}
          {currentUser && currentUser.role === 'FACULTY' && 'Courses You Teach'}
          {currentUser && currentUser.role === 'ADMIN' && 'All Courses'}
        </h3>
        
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Number</th>
              <th>Instructor</th>
              <th>Department</th>
              <th>Credits</th>
              <th>Term</th>
              {canModifyCourses && <th>Actions</th>}
              <th>Course Content</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={canModifyCourses ? "8" : "7"} style={{textAlign: 'center'}}>No courses found</td>
              </tr>
            ) : (
              courses.map(course => {
                // Safely extract instructor name
                let instructorName = "Not Assigned";
                if (course.instructor) {
                  if (typeof course.instructor === 'object') {
                    const firstName = course.instructor.firstName || '';
                    const lastName = course.instructor.lastName || '';
                    
                    if (firstName || lastName) {
                      instructorName = `${firstName} ${lastName}`.trim();
                    } else if (course.instructor.username) {
                      instructorName = course.instructor.username;
                    } else if (course.instructor.email) {
                      instructorName = course.instructor.email;
                    }
                  } else {
                    // If instructor is just an ID, we can handle this case too
                    instructorName = "ID: " + course.instructor;
                  }
                }
                
                return (
                  <tr key={course._id}>
                    <td>{course.name}</td>
                    <td>{course.number}</td>
                    <td>{instructorName}</td>
                    <td>{course.department || 'N/A'}</td>
                    <td>{course.credits || 'N/A'}</td>
                    <td>{course.term || 'N/A'}</td>
                    {canModifyCourses && (
                      <td>
                        {/* Faculty can only edit their own courses, admins can edit any */}
                        {(currentUser.role === 'ADMIN' || 
                          (currentUser.role === 'FACULTY' && 
                           course.instructor && 
                           course.instructor._id === currentUser.id)) && (
                          <button onClick={() => handleEdit(course)}>Edit</button>
                        )}
                        
                        {/* Only admins can delete courses */}
                        {canDeleteCourses && (
                          <button onClick={() => handleDelete(course._id)}>Delete</button>
                        )}
                      </td>
                    )}
                    <td>
                      <button 
                        onClick={() => handleViewQuizzes(course.number)}
                        className="view-button"
                      >
                        View Quizzes
                      </button>
                      <button 
                        onClick={() => handleViewAssignments(course.number)}
                        className="view-button"
                      >
                        View Assignments
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CoursePage
