import { useState, useEffect } from 'react'
import { getEnrollments, createEnrollment, updateEnrollment, deleteEnrollment } from '../services/enrollmentService'
import { getUsers } from '../services/userService'
import { getCourses } from '../services/courseService'

function EnrollmentPage() {
  const [enrollments, setEnrollments] = useState([])
  const [currentEnrollment, setCurrentEnrollment] = useState({
    studentId: '',
    courseId: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'active'
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
      const response = await getEnrollments()
      setEnrollments(response.data)
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    }
  }

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
        studentId: '',
        courseId: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'active'
      })
      setEditing(false)
      fetchEnrollments()
    } catch (error) {
      console.error('Error saving enrollment:', error)
    }
  }

  const handleEdit = (enrollment) => {
    setCurrentEnrollment(enrollment)
    setEditing(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteEnrollment(id)
      fetchEnrollments()
    } catch (error) {
      console.error('Error deleting enrollment:', error)
    }
  }

  // Helper function to find user name by ID
  const getUserName = (id) => {
    const user = users.find(user => user._id === id)
    return user ? user.name : 'Unknown'
  }

  // Helper function to find course title by ID
  const getCourseTitle = (id) => {
    const course = courses.find(course => course._id === id)
    return course ? course.title : 'Unknown'
  }

  return (
    <div className="page-container">
      <h2>Enrollments</h2>
      
      <form onSubmit={handleSubmit} className="form">
        <h3>{editing ? 'Edit Enrollment' : 'Add New Enrollment'}</h3>
        <div className="form-group">
          <label>Student</label>
          <select
            name="studentId"
            value={currentEnrollment.studentId}
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
            name="courseId"
            value={currentEnrollment.courseId}
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
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>
        <button type="submit">{editing ? 'Update' : 'Create'}</button>
        {editing && (
          <button type="button" onClick={() => {
            setCurrentEnrollment({
              studentId: '',
              courseId: '',
              enrollmentDate: new Date().toISOString().split('T')[0],
              status: 'active'
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
            {enrollments.map(enrollment => (
              <tr key={enrollment._id}>
                <td>{getUserName(enrollment.studentId)}</td>
                <td>{getCourseTitle(enrollment.courseId)}</td>
                <td>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</td>
                <td>{enrollment.status}</td>
                <td>
                  <button onClick={() => handleEdit(enrollment)}>Edit</button>
                  <button onClick={() => handleDelete(enrollment._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EnrollmentPage
