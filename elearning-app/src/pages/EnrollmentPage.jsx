import { useState, useEffect } from 'react'
import { getEnrollments, createEnrollment, updateEnrollment, deleteEnrollment } from '../services/enrollmentService'
import { getUsers } from '../services/userService'
import { getCourses } from '../services/courseService'

function EnrollmentPage() {
  const [enrollments, setEnrollments] = useState([])
  const [currentEnrollment, setCurrentEnrollment] = useState({
    user: '',           // Changed from studentId to user
    course: '',         // Changed from courseId to course
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE'
  })
  const [editing, setEditing] = useState(false)
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])

  useEffect(() => {
    fetchEnrollments()
    fetchUsers()
    fetchCourses()
  }, [])

  const fetchEnrollments = async () => {
    try {
      const response = await getEnrollments();
      console.log('Enrollments response:', response.data);
      setEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers()
      // Filter for students only
      const students = response.data.filter(user => user.role === 'STUDENT')
      setUsers(students)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await getCourses()
      setCourses(response.data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentEnrollment({ ...currentEnrollment, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await updateEnrollment(currentEnrollment._id, currentEnrollment)
      } else {
        await createEnrollment(currentEnrollment)
      }
      setCurrentEnrollment({
        user: '',       // Changed from studentId to user
        course: '',     // Changed from courseId to course
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
      })
      setEditing(false)
      fetchEnrollments()
    } catch (error) {
      console.error('Error saving enrollment:', error)
    }
  }

  const handleEdit = (enrollment) => {
    // Create a copy of the enrollment to modify
    const enrollmentToEdit = { ...enrollment };
    
    // Format the date correctly for the date input (yyyy-MM-dd)
    if (enrollmentToEdit.enrollmentDate) {
      const date = new Date(enrollmentToEdit.enrollmentDate);
      // Use local date components to avoid timezone issues
      const year = date.getFullYear();
      // Month is 0-based in JavaScript (0 = January)
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      enrollmentToEdit.enrollmentDate = `${year}-${month}-${day}`;
    }
    
    // Make sure we use the IDs for the dropdowns, not the objects
    if (typeof enrollmentToEdit.user === 'object' && enrollmentToEdit.user !== null) {
      enrollmentToEdit.user = enrollmentToEdit.user._id;
    }
    
    if (typeof enrollmentToEdit.course === 'object' && enrollmentToEdit.course !== null) {
      enrollmentToEdit.course = enrollmentToEdit.course._id;
    }
    
    setCurrentEnrollment(enrollmentToEdit);
    setEditing(true);
  }

  const handleDelete = async (id) => {
    try {
      await deleteEnrollment(id)
      fetchEnrollments()
    } catch (error) {
      console.error('Error deleting enrollment:', error)
    }
  }

  return (
    <div className="page-container">
      <h2>Enrollments</h2>
      
      <form onSubmit={handleSubmit} className="form">
        <h3>{editing ? 'Edit Enrollment' : 'Add New Enrollment'}</h3>
        <div className="form-group">
          <label>Student</label>
          <select
            name="user"      // Changed from studentId to user
            value={currentEnrollment.user}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a student</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.firstName +" "+ user.lastName}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Course</label>
          <select
            name="course"    // Changed from courseId to course
            value={currentEnrollment.course}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Enrollment Date</label>
          <input
            type="date"
            name="enrollmentDate"
            value={currentEnrollment.enrollmentDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select
            name="status"
            value={currentEnrollment.status}
            onChange={handleInputChange}
            required
          >
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="DROPPED">Dropped</option>
            <option value="PENDING">Pending</option> {/* Fixed from "Dropped" to "Pending" */}
          </select>
        </div>
        <button type="submit">{editing ? 'Update' : 'Create'}</button>
        {editing && (
          <button type="button" onClick={() => {
            setCurrentEnrollment({
              user: '',       // Changed from studentId to user
              course: '',     // Changed from courseId to course
              enrollmentDate: new Date().toISOString().split('T')[0],
              status: 'ACTIVE'
            })
            setEditing(false)
          }}>Cancel</button>
        )}
      </form>

      <div className="list-container">
        <h3>Enrollment List</h3>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Enrollment Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.length === 0 ? (
              <tr>
                <td colSpan="5" style={{textAlign: 'center'}}>No enrollments found</td>
              </tr>
            ) : (
              enrollments.map(enrollment => {
                console.log('Rendering enrollment:', enrollment);
                return (
                  <tr key={enrollment._id}>
                    <td>{enrollment.user.firstName + " " + enrollment.user.lastName}</td>
                    <td>{enrollment.course.name}</td>
                    <td>{enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{enrollment.status}</td>
                    <td>
                      <button onClick={() => handleEdit(enrollment)}>Edit</button>
                      <button onClick={() => handleDelete(enrollment._id)}>Delete</button>
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

export default EnrollmentPage
