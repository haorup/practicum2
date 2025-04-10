import { useState, useEffect } from 'react'
import { getAssignments, createAssignment, updateAssignment, deleteAssignment } from '../services/assignmentService'
import { getCourses } from '../services/courseService'

function AssignmentPage() {
  const [assignments, setAssignments] = useState([])
  const [currentAssignment, setCurrentAssignment] = useState({
    title: '',
    content: '', // Changed from description to content to match database schema
    dueDate: new Date().toISOString().split('T')[0],
    course_number: '',
    points: 0,
    releasedOrNot: false,
    startingDate: new Date().toISOString().split('T')[0],
    outDatedOrNot: false
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
    if (name === 'releasedOrNot') {
      setCurrentAssignment({ ...currentAssignment, [name]: value === 'true' })
    } else {
      setCurrentAssignment({ ...currentAssignment, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Create a formatted assignment object for API submission
      const assignmentToSubmit = {
        ...currentAssignment,
        // Ensure dates are properly formatted strings if needed by API
        startingDate: new Date(currentAssignment.startingDate).toISOString(),
        dueDate: new Date(currentAssignment.dueDate).toISOString(),
        // Ensure boolean values are properly formatted
        releasedOrNot: Boolean(currentAssignment.releasedOrNot),
        outDatedOrNot: Boolean(currentAssignment.outDatedOrNot)
      };

      console.log('Submitting assignment:', assignmentToSubmit);
      
      if (editing) {
        const response = await updateAssignment(currentAssignment._id, assignmentToSubmit);
        console.log('Update response:', response);
      } else {
        await createAssignment(assignmentToSubmit);
      }

      // Reset form values
      setCurrentAssignment({
        title: '',
        content: '',
        dueDate: new Date().toISOString().split('T')[0],
        course_number: '',
        points: 0,
        releasedOrNot: false,
        startingDate: new Date().toISOString().split('T')[0],
        outDatedOrNot: false
      });
      setEditing(false);
      fetchAssignments();
    } catch (error) {
      console.error('Error saving assignment:', error);
      // Display more detailed error information if available
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  }

  const handleEdit = (assignment) => {
    console.log('Original assignment for editing:', assignment);
    
    // Make a clean copy with all required fields
    const editAssignment = {
      _id: assignment._id, // Ensure ID is included
      title: assignment.title || '',
      content: assignment.content || '', // Make sure this matches your schema
      course_number: assignment.course_number || '',
      points: assignment.points || 0,
      
      // Format dates properly
      dueDate: assignment.dueDate ? 
               new Date(assignment.dueDate).toISOString().split('T')[0] : 
               new Date().toISOString().split('T')[0],
      
      startingDate: assignment.startingDate ? 
                    new Date(assignment.startingDate).toISOString().split('T')[0] : 
                    new Date().toISOString().split('T')[0],
      
      // Ensure boolean values are properly handled
      releasedOrNot: Boolean(assignment.releasedOrNot),
      outDatedOrNot: Boolean(assignment.outDatedOrNot)
    };
    
    console.log('Formatted assignment for editing:', editAssignment);
    setCurrentAssignment(editAssignment);
    setEditing(true);
  }

  const handleDelete = async (id) => {
    try {
      await deleteAssignment(id)
      fetchAssignments()
    } catch (error) {
      console.error('Error deleting assignment:', error)
    }
  }

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
            name="content"
            value={currentAssignment.content}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Starting Date</label>
          <input
            type="date"
            name="startingDate"
            value={currentAssignment.startingDate}
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
              <option key={course._id} value={course.number}>
                {course.name} ({course.number})
              </option>
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
        <div className="form-group">
          <label>Released</label>
          <select
            name="releasedOrNot"
            value={currentAssignment.releasedOrNot.toString()}
            onChange={handleInputChange}
            required
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <button type="submit">{editing ? 'Update' : 'Create'}</button>
        {editing && (
          <button type="button" onClick={() => {
            setCurrentAssignment({
              title: '',
              content: '',
              dueDate: new Date().toISOString().split('T')[0],
              course_number: '',
              points: 0,
              releasedOrNot: false,
              startingDate: new Date().toISOString().split('T')[0],
              outDatedOrNot: false
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
