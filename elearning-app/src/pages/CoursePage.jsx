import { useState, useEffect } from 'react'
import { getCourses, createCourse, updateCourse, deleteCourse } from '../services/courseService'
import { getUsers } from '../services/userService'

function CoursePage() {
  const [courses, setCourses] = useState([])
  const [currentCourse, setCurrentCourse] = useState({
    name: '',
    number: '',
    term: '2025 SP',
    instructor: null,
    department: '',
    credits: 3,
    description: '',
    lessons: []
  })
  const [editing, setEditing] = useState(false)
  const [faculty, setFaculty] = useState([])

  useEffect(() => {
    fetchCourses()
    fetchFaculty()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await getCourses()
      console.log("Fetched courses:", response.data)
      setCourses(response.data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchFaculty = async () => {
    try {
      const response = await getUsers()
      const facultyUsers = response.data.filter(user => user.role === 'FACULTY')
      setFaculty(facultyUsers)
    } catch (error) {
      console.error('Error fetching faculty:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'credits') {
      setCurrentCourse({ ...currentCourse, [name]: Number(value) })
    } else if (name === 'instructor') {
      const selectedInstructor = value === '' ? null : faculty.find(f => f._id === value) || null
      setCurrentCourse({ ...currentCourse, [name]: selectedInstructor })
    } else {
      setCurrentCourse({ ...currentCourse, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Create a clean object with only the fields we want to update
      const courseToSubmit = {
        name: currentCourse.name,
        number: currentCourse.number,
        term: currentCourse.term,
        department: currentCourse.department,
        credits: currentCourse.credits,
        description: currentCourse.description,
        // Send only the instructor ID, not the entire object
        instructor: currentCourse.instructor ? currentCourse.instructor._id : null
      };
      
      console.log("Preparing to submit course:", courseToSubmit);
      
      if (editing) {
        console.log(`Updating course with ID: ${currentCourse._id}`);
        const response = await updateCourse(currentCourse._id, courseToSubmit);
        console.log("Update response:", response);
        
        // Force refetch to see if instructor was actually updated on server
        setTimeout(() => fetchCourses(), 500);
      } else {
        await createCourse(courseToSubmit);
      }
      
      setCurrentCourse({
        name: '',
        number: '',
        term: '2025 SP',
        instructor: null,
        department: '',
        credits: 3,
        description: '',
        lessons: []
      });
      setEditing(false);
    } catch (error) {
      console.error('Error saving course:', error);
      alert(`Failed to save course: ${error.response?.data?.message || error.message}`);
    }
  }

  const handleEdit = (course) => {
    setCurrentCourse({ ...course })
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

  const getInstructorName = (instructor) => {
    if (!instructor) return 'None'
    return `${instructor.firstName} ${instructor.lastName}`
  }

  return (
    <div className="page-container">
      <h2>Courses</h2>
      
      <form onSubmit={handleSubmit} className="form">
        <h3>{editing ? 'Edit Course' : 'Add New Course'}</h3>
        
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
          <label>Term</label>
          <input
            type="text"
            name="term"
            value={currentCourse.term}
            onChange={handleInputChange}
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
          <label>Credits</label>
          <input
            type="number"
            name="credits"
            value={currentCourse.credits}
            onChange={handleInputChange}
            required
            min="1"
            max="6"
          />
        </div>
        
        <div className="form-group">
          <label>Instructor</label>
          <select
            name="instructor"
            value={currentCourse.instructor ? currentCourse.instructor._id : ''}
            onChange={handleInputChange}
          >
            <option value="">Select an Instructor</option>
            {faculty.map(instructor => (
              <option key={instructor._id} value={instructor._id}>
                {instructor.firstName} {instructor.lastName}
              </option>
            ))}
          </select>
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
        
        <button type="submit">{editing ? 'Update' : 'Create'}</button>
        {editing && (
          <button type="button" onClick={() => {
            setCurrentCourse({
              name: '',
              number: '',
              term: '2025 SP',
              instructor: null,
              department: '',
              credits: 3,
              description: '',
              lessons: []
            })
            setEditing(false)
          }}>Cancel</button>
        )}
      </form>

      <div className="list-container">
        <h3>Course List</h3>
        <table>
          <thead>
            <tr>
              <th>Number</th>
              <th>Name</th>
              <th>Term</th>
              <th>Department</th>
              <th>Credits</th>
              <th>Instructor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course._id}>
                <td>{course.number}</td>
                <td>{course.name}</td>
                <td>{course.term}</td>
                <td>{course.department}</td>
                <td>{course.credits}</td>
                <td>{getInstructorName(course.instructor)}</td>
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
