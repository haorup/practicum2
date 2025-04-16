import { useState, useEffect } from 'react'
import { getQuizzes, createQuiz, updateQuiz, deleteQuiz } from '../services/quizService'
import { getCourses, getCourse } from '../services/courseService'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { FaEdit, FaTrash } from 'react-icons/fa'
import '../styles/EnrollmentPage.css' // Reuse role badge styles
import '../styles/QuizPage.css' // Import the QuizPage specific styles

function QuizPage() {
  const [quizzes, setQuizzes] = useState([])
  const [currentQuiz, setCurrentQuiz] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    courses: '', // This will be set from URL params
    timeLimit: 60,
    type: 'Graded Quiz',
    points: 100,
    assignmentGroup: 'QUIZZES',
    browserRequired: false,
    webcamRequired: false,
    questionsNum: 0,
    questions: [],
    published: false
  })
  const [editing, setEditing] = useState(false)
  const [courses, setCourses] = useState([])
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)
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
      setCurrentQuiz(prev => ({
        ...prev,
        courses: courseNumber
      }));
      fetchCourseDetails();
      fetchQuizzesByCourse();
    } else {
      // Redirect to courses page if no course number is provided
      navigate('/courses');
    }

    fetchCourses();
  }, [courseNumber, currentUser, navigate]);

  const fetchCourseDetails = async () => {
    try {
      // Find the course in the existing courses list that matches the courseNumber
      const response = await getCourse(courseNumber);
      setCurrentCourse(response.data);
    } catch (error) {
      console.error('Error fetching course details:', error);
      // Removed the error message that was showing "Course not found"
    }
  };

  const fetchQuizzesByCourse = async () => {
    try {
      const response = await getQuizzes();
      // Filter quizzes for the current course
      const filteredQuizzes = response.data.filter(
        quiz => quiz.courses === courseNumber
      );
      setQuizzes(filteredQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to load quizzes');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuiz({ ...currentQuiz, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setDebugInfo(null);

    // Check if user has permission to create/edit quizzes - simplified to just role check
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'FACULTY') {
      setError('You do not have permission to create or edit quizzes');
      return;
    }

    try {
      // Ensure course number is set correctly
      if (!currentQuiz.courses) {
        setError("Please select a course");
        return;
      }

      const quizToSubmit = {
        ...currentQuiz,
        due: currentQuiz.dueDate,
        availableFrom: currentQuiz.dueDate,
        availableUntil: currentQuiz.dueDate
      };

      if (editing) {
        await updateQuiz(currentQuiz._id, quizToSubmit);
      } else {
        await createQuiz(currentQuiz.courses, quizToSubmit);
      }

      setCurrentQuiz({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        courses: courseNumber, // Keep the current course number
        timeLimit: 60,
        type: 'Graded Quiz',
        points: 100,
        assignmentGroup: 'QUIZZES',
        browserRequired: false,
        webcamRequired: false,
        questionsNum: 0,
        questions: [],
        published: false
      });
      setEditing(false);
      fetchQuizzesByCourse(); // Reload quizzes for this course
    } catch (error) {
      console.error('Error saving quiz:', error);
      setError(error.response?.data?.message || error.message || 'Failed to save quiz');
    }
  };

  const handleEdit = (quiz) => {
    // Check if user has permission to edit - simplified to just role check
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'FACULTY') {
      setError('You do not have permission to edit quizzes');
      return;
    }

    try {
      const editedQuiz = {
        ...quiz,
        dueDate: quiz.due ? new Date(quiz.due).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        timeLimit: parseInt(quiz.timeLimit) || 60,
        points: parseInt(quiz.points) || 100,
        assignmentGroup: quiz.assignmentGroup || 'QUIZZES',
        type: quiz.type || 'Graded Quiz',
        browserRequired: Boolean(quiz.browserRequired),
        webcamRequired: Boolean(quiz.webcamRequired),
        questionsNum: parseInt(quiz.questionsNum) || 0,
        questions: Array.isArray(quiz.questions) ? quiz.questions : [],
        published: Boolean(quiz.published),
        courses: quiz.courses ? quiz.courses.trim() : courseNumber
      };
      
      setCurrentQuiz(editedQuiz);
      setEditing(true);
      
      document.querySelector('.form').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Error in handleEdit:', err);
      setError(`Error preparing quiz for edit: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    // Check if user has permission to delete - simplified to just role check
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'FACULTY') {
      setError('You do not have permission to delete quizzes');
      return;
    }

    try {
      await deleteQuiz(id);
      fetchQuizzesByCourse(); // Reload quizzes for this course
    } catch (error) {
      console.error('Error deleting quiz:', error);
      setError('Failed to delete quiz');
    }
  };

  const handleBackToCourses = () => {
    navigate('/courses');
  };

  // Check for read-only access (STUDENT role)
  const isReadOnly = currentUser && currentUser.role === 'STUDENT';

  // Simplified check - faculty has same abilities as admin
  const canModifyQuizzes = currentUser && 
    (currentUser.role === 'ADMIN' || currentUser.role === 'FACULTY');

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={handleBackToCourses} className="back-button">
          &larr; Back to Courses
        </button>
        <h2>Quizzes for {currentCourse ? `${currentCourse.name} (${currentCourse.number})` : courseNumber}</h2>
      </div>

      {/* Display role-based indicators - simplified faculty label */}
      <div className="role-indicator">
        {currentUser && currentUser.role === 'ADMIN' && <p className="role-badge admin">Administrator View (Full Access)</p>}
        {currentUser && currentUser.role === 'FACULTY' && 
          <p className="role-badge faculty">Faculty View</p>}
        {currentUser && currentUser.role === 'STUDENT' && <p className="role-badge student">Student View (Read Only)</p>}
      </div>

      {error && (
        <div className="error-message">Error: {error}</div>
      )}

      {/* Only show form if user can modify quizzes */}
      {canModifyQuizzes && (
        <form onSubmit={handleSubmit} className="form">
          <h3>{editing ? 'Edit Quiz' : 'Add New Quiz'}</h3>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={currentQuiz.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={currentQuiz.description}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={currentQuiz.dueDate}
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
              name="courses"
              value={courseNumber}
            />
          </div>
          <div className="form-group">
            <label>Time Limit (minutes)</label>
            <input
              type="number"
              name="timeLimit"
              value={currentQuiz.timeLimit}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Points</label>
            <input
              type="number"
              name="points"
              value={currentQuiz.points}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Assignment Group</label>
            <select
              name="assignmentGroup"
              value={currentQuiz.assignmentGroup}
              onChange={handleInputChange}
              required
            >
              <option value="QUIZZES">Quizzes</option>
              <option value="EXAMS">Exams</option>
            </select>
          </div>
          <div className="form-group">
            <label>Published</label>
            <select
              name="published"
              value={currentQuiz.published.toString()}
              onChange={(e) => setCurrentQuiz({ ...currentQuiz, published: e.target.value === 'true' })}
              required
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <button type="submit">{editing ? 'Update' : 'Create'}</button>
          {editing && (
            <button type="button" onClick={() => {
              setCurrentQuiz({
                title: '',
                description: '',
                dueDate: new Date().toISOString().split('T')[0],
                courses: courseNumber,
                timeLimit: 60,
                type: 'Graded Quiz',
                points: 100,
                assignmentGroup: 'QUIZZES',
                browserRequired: false,
                webcamRequired: false,
                questionsNum: 0,
                questions: [],
                published: false
              });
              setEditing(false);
            }}>Cancel</button>
          )}
        </form>
      )}

      <div className="list-container">
        <h3>Quiz List</h3>
        {quizzes.length === 0 ? (
          <p>No quizzes found for this course</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Due Date</th>
                <th>Time Limit</th>
                <th>Points</th>
                <th>Published</th>
                {canModifyQuizzes && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {quizzes.map(quiz => (
                <tr key={quiz._id}>
                  <td>{quiz.title}</td>
                  <td>{quiz.description}</td>
                  <td>{quiz.due}</td>
                  <td>{quiz.timeLimit} min</td>
                  <td>{quiz.points}</td>
                  <td>{quiz.published ? 'Yes' : 'No'}</td>
                  {canModifyQuizzes && (
                    <td>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleEdit(quiz);
                        }}
                        className="icon-button edit-icon"
                        title="Edit quiz"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(quiz._id)}
                        className="icon-button delete-icon"
                        title="Delete quiz"
                      >
                        <FaTrash />
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

export default QuizPage;
