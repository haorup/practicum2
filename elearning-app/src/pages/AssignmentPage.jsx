import { useState, useEffect } from 'react'
import { getAssignments, createAssignment, updateAssignment, deleteAssignment } from '../services/assignmentService'
import { getCourse } from '../services/courseService'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import '../styles/EnrollmentPage.css' // Reuse role badge styles
import '../styles/QuizPage.css' // Import the QuizPage specific styles

function AssignmentPage() {
  const [assignments, setAssignments] = useState([])
  const [currentAssignment, setCurrentAssignment] = useState({
    title: '',
    content: '',
    dueDate: new Date().toISOString().split('T')[0],
    course_number: '',
    points: 0,
    releasedOrNot: false,
    startingDate: new Date().toISOString().split('T')[0],
    outDatedOrNot: false
  })
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState(null)
  const [currentCourse, setCurrentCourse] = useState(null)
  const { courseNumber } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useUser()

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // If courseNumber is provided, set it as the current course
    if (courseNumber) {
      setCurrentAssignment(prev => ({
        ...prev,
        course_number: courseNumber
      }));
      fetchCourseDetails();
      fetchAssignmentsByCourse();
    } else {
      // Redirect to courses page if no course number is provided
      navigate('/courses');
    }
  }, [courseNumber, currentUser, navigate]);

  const fetchCourseDetails = async () => {
    try {
      const response = await getCourse(courseNumber);
      setCurrentCourse(response.data);
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const fetchAssignmentsByCourse = async () => {
    try {
      const response = await getAssignments();
      // Filter assignments for the current course
      const filteredAssignments = response.data.filter(
        assignment => assignment.course_number === courseNumber
      );
      setAssignments(filteredAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Failed to load assignments');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'releasedOrNot') {
      setCurrentAssignment({ ...currentAssignment, [name]: value === 'true' });
    } else {
      setCurrentAssignment({ ...currentAssignment, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Check if user has permission to create/edit assignments
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'FACULTY') {
      setError('You do not have permission to create or edit assignments');
      return;
    }

    try {
      const assignmentToSubmit = {
        ...currentAssignment,
        startingDate: new Date(currentAssignment.startingDate).toISOString(),
        dueDate: new Date(currentAssignment.dueDate).toISOString(),
        releasedOrNot: Boolean(currentAssignment.releasedOrNot),
        outDatedOrNot: Boolean(currentAssignment.outDatedOrNot),
        course_number: courseNumber
      };

      if (editing) {
        await updateAssignment(currentAssignment._id, assignmentToSubmit);
      } else {
        await createAssignment(assignmentToSubmit);
      }

      setCurrentAssignment({
        title: '',
        content: '',
        dueDate: new Date().toISOString().split('T')[0],
        course_number: courseNumber, // Keep the current course number
        points: 0,
        releasedOrNot: false,
        startingDate: new Date().toISOString().split('T')[0],
        outDatedOrNot: false
      });
      setEditing(false);
      fetchAssignmentsByCourse(); // Reload assignments for this course
    } catch (error) {
      console.error('Error saving assignment:', error);
      setError(error.response?.data?.message || error.message || 'Failed to save assignment');
    }
  };

  const handleEdit = (assignment) => {
    // Check if user has permission to edit
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'FACULTY') {
      setError('You do not have permission to edit assignments');
      return;
    }

    try {
      const editedAssignment = {
        ...assignment,
        dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        startingDate: assignment.startingDate ? new Date(assignment.startingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        releasedOrNot: Boolean(assignment.releasedOrNot),
        outDatedOrNot: Boolean(assignment.outDatedOrNot),
        course_number: assignment.course_number || courseNumber
      };
      
      setCurrentAssignment(editedAssignment);
      setEditing(true);
      
      document.querySelector('.form').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Error in handleEdit:', err);
      setError(`Error preparing assignment for edit: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    // Check if user has permission to delete
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'FACULTY') {
      setError('You do not have permission to delete assignments');
      return;
    }

    try {
      await deleteAssignment(id);
      fetchAssignmentsByCourse(); // Reload assignments for this course
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setError('Failed to delete assignment');
    }
  };

  const handleBackToCourses = () => {
    navigate('/courses');
  };

  // Check for read-only access (STUDENT role)
  const isReadOnly = currentUser && currentUser.role === 'STUDENT';

  // Faculty or Admin can modify assignments
  const canModifyAssignments = currentUser && 
    (currentUser.role === 'ADMIN' || currentUser.role === 'FACULTY');

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={handleBackToCourses} className="back-button">
          &larr; Back to Courses
        </button>
        <h2>Assignments for {currentCourse ? `${currentCourse.name} (${currentCourse.number})` : courseNumber}</h2>
      </div>

      {/* Display role-based indicators */}
      <div className="role-indicator">
        {currentUser && currentUser.role === 'ADMIN' && <p className="role-badge admin">Administrator View (Full Access)</p>}
        {currentUser && currentUser.role === 'FACULTY' && 
          <p className="role-badge faculty">Faculty View</p>}
        {currentUser && currentUser.role === 'STUDENT' && <p className="role-badge student">Student View (Read Only)</p>}
      </div>

      {error && (
        <div className="error-message">Error: {error}</div>
      )}

      {/* Only show form if user can modify assignments */}
      {canModifyAssignments && (
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
            <input
              type="text"
              value={`${currentCourse ? currentCourse.name : ''} (${courseNumber})`}
              disabled
            />
            <input
              type="hidden"
              name="course_number"
              value={courseNumber}
            />
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
                course_number: courseNumber,
                points: 0,
                releasedOrNot: false,
                startingDate: new Date().toISOString().split('T')[0],
                outDatedOrNot: false
              });
              setEditing(false);
            }}>Cancel</button>
          )}
        </form>
      )}

      <div className="list-container">
        <h3>Assignment List</h3>
        {assignments.length === 0 ? (
          <p>No assignments found for this course</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Due Date</th>
                <th>Points</th>
                <th>Released</th>
                {canModifyAssignments && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment._id}>
                  <td>{assignment.title}</td>
                  <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                  <td>{assignment.points}</td>
                  <td>{assignment.releasedOrNot ? 'Yes' : 'No'}</td>
                  {canModifyAssignments && (
                    <td>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleEdit(assignment);
                        }}
                        className="action-button edit-button"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(assignment._id)}
                        className="action-button delete-button"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AssignmentPage
