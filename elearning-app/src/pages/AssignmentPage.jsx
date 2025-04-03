import { useState, useEffect } from 'react'
import { getAssignments, createAssignment, updateAssignment, deleteAssignment } from '../services/assignmentService'
import { getCourses } from '../services/courseService'

function AssignmentPage() {
  const [assignments, setAssignments] = useState([])
  const [currentAssignment, setCurrentAssignment] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    course_number: '',
    points: 0
  })
  const [editing, setEditing] = useState(false)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    fetchAssignments()
    fetchCourses()
  }, [])

  const fetchAssignments = async () => {
    try {
      const response = await getAssignments()
      setAssignments(response.data)
    } catch (error) {
      console.error('Error fetching assignments:', error)
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
    setCurrentAssignment({ ...currentAssignment, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await updateAssignment(currentAssignment._id, currentAssignment)
      } else {
        await createAssignment(currentAssignment)
      }
      setCurrentAssignment({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        course_number: '',
        points: 0
      })
      setEditing(false)
      fetchAssignments()
    } catch (error) {
      console.error('Error saving assignment:', error)
    }
  }

  const handleEdit = (assignment) => {
    setCurrentAssignment({
      ...assignment,
      dueDate: new Date(assignment.dueDate).toISOString().split('T')[0]
    })
    setEditing(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteAssignment(id)
      fetchAssignments()
    } catch (error) {
      console.error('Error deleting assignment:', error)
    }
  }

  // Helper function to find course title by course number
  const getCourseTitle = (courseNumber) => {
    const course = courses.find(course => course.course_number === courseNumber)
    return course ? course.title : 'Unknown'
  }

  return (
    <div className="page-container">
      <h2>Assignments</h2>
      
      <form onSubmit={handleSubmit} className="form">
        <h3>{editing ? 'Edit Assignment' : 'Add New Assignment'}</h3>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={currentAssignment.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={currentAssignment.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={currentAssignment.dueDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Course</label>
          <select
            name="course_number"
            value={currentAssignment.course_number}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course._id} value={course.course_number}>{course.title} ({course.course_number})</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Points</label>
          <input
            type="number"
            name="points"
            value={currentAssignment.points}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">{editing ? 'Update' : 'Create'}</button>
        {editing && (
          <button type="button" onClick={() => {
            setCurrentAssignment({
              title: '',
              description: '',
              dueDate: new Date().toISOString().split('T')[0],
              course_number: '',
              points: 0
            })
            setEditing(false)
          }}>Cancel</button>
        )}
      </form>

      <div className="list-container">
        <h3>Assignment List</h3>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Due Date</th>
              <th>Course</th>
              <th>Points</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(assignment => (
              <tr key={assignment._id}>
                <td>{assignment.title}</td>
                <td>{assignment.description}</td>
                <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                <td>{assignment.course_number}</td>
                <td>{assignment.points}</td>
                <td>
                  <button onClick={() => handleEdit(assignment)}>Edit</button>
                  <button onClick={() => handleDelete(assignment._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AssignmentPage
