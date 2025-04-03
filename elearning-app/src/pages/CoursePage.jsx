import { useState, useEffect } from 'react'
import { getCourses, createCourse, updateCourse, deleteCourse } from '../services/courseService'

function CoursePage() {
  const [courses, setCourses] = useState([])
  const [currentCourse, setCurrentCourse] = useState({ title: '', description: '', instructor: '' })
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [])

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
    setCurrentCourse({ ...currentCourse, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await updateCourse(currentCourse._id, currentCourse)
      } else {
        await createCourse(currentCourse)
      }
      setCurrentCourse({ title: '', description: '', instructor: '' })
      setEditing(false)
      fetchCourses()
    } catch (error) {
      console.error('Error saving course:', error)
    }
  }

  const handleEdit = (course) => {
    setCurrentCourse(course)
    setEditing(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteCourse(id)
      fetchCourses()
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  return (
    <div className="page-container">
      <h2>Courses</h2>
      
      <form onSubmit={handleSubmit} className="form">
        <h3>{editing ? 'Edit Course' : 'Add New Course'}</h3>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={currentCourse.title}
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
            required
          />
        </div>
        <div className="form-group">
          <label>Instructor</label>
          <input
            type="text"
            name="instructor"
            value={currentCourse.instructor}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">{editing ? 'Update' : 'Create'}</button>
        {editing && (
          <button type="button" onClick={() => {
            setCurrentCourse({ title: '', description: '', instructor: '' })
            setEditing(false)
          }}>Cancel</button>
        )}
      </form>

      <div className="list-container">
        <h3>Course List</h3>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Instructor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course._id}>
                <td>{course.title}</td>
                <td>{course.description}</td>
                <td>{course.instructor}</td>
                <td>
                  <button onClick={() => handleEdit(course)}>Edit</button>
                  <button onClick={() => handleDelete(course._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CoursePage
