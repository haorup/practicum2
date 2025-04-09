import { useState, useEffect } from 'react'
import { getQuizzes, createQuiz, updateQuiz, deleteQuiz } from '../services/quizService'
import { getCourses } from '../services/courseService'

function QuizPage() {
  const [quizzes, setQuizzes] = useState([])
  const [currentQuiz, setCurrentQuiz] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    courses: '', // Changed from courseId to courses
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

  useEffect(() => {
    fetchQuizzes()
    fetchCourses()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const response = await getQuizzes()
      setQuizzes(response.data)
    } catch (error) {
      console.error('Error fetching quizzes:', error)
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
    setCurrentQuiz({ ...currentQuiz, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setDebugInfo(null)

    try {
      if (!currentQuiz.courses) {
        setError("Please select a course")
        return
      }

      const quizToSubmit = {
        ...currentQuiz,
        due: currentQuiz.dueDate,
        availableFrom: currentQuiz.dueDate,
        availableUntil: currentQuiz.dueDate
      }

      console.log(editing ? `Updating quiz ${currentQuiz._id}:` : 'Creating new quiz:', quizToSubmit)
      setDebugInfo(JSON.stringify(quizToSubmit, null, 2))

      if (editing) {
        await updateQuiz(currentQuiz._id, quizToSubmit)
      } else {
        await createQuiz(currentQuiz.courses, quizToSubmit)
      }

      setCurrentQuiz({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        courses: '', // Changed from courseId to courses
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
      setEditing(false)
      fetchQuizzes()
    } catch (error) {
      console.error('Error saving quiz:', error)
      setError(error.response?.data?.message || error.message || 'Failed to save quiz')
      if (error.response) {
        console.log('Error response:', error.response)
        setDebugInfo(JSON.stringify({
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        }, null, 2))
      }
    }
  }

  const handleEdit = (quiz) => {
    try {
      console.log('Edit button clicked, quiz data:', quiz);
      
      if (!quiz || !quiz._id) {
        console.error('Invalid quiz data for editing:', quiz);
        setError('Cannot edit: Invalid quiz data');
        return;
      }
      
      // Make a deep copy of the quiz to avoid reference issues
      const editedQuiz = {
        ...quiz,
        // Convert dates properly with fallback
        dueDate: quiz.due ? new Date(quiz.due).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        
        // Ensure all needed fields are present
        timeLimit: parseInt(quiz.timeLimit) || 60,
        points: parseInt(quiz.points) || 100,
        assignmentGroup: quiz.assignmentGroup || 'QUIZZES',
        type: quiz.type || 'Graded Quiz',
        browserRequired: Boolean(quiz.browserRequired),
        webcamRequired: Boolean(quiz.webcamRequired),
        questionsNum: parseInt(quiz.questionsNum) || 0,
        questions: Array.isArray(quiz.questions) ? quiz.questions : [],
        published: Boolean(quiz.published),
        // Ensure courses is correctly set and trimmed of any whitespace
        courses: quiz.courses ? quiz.courses.trim() : ''
      };
      
      console.log('Formatted quiz for editing:', editedQuiz);
      console.log('Course value set to:', editedQuiz.courses);
      
      // Check if the course exists in the available courses
      const courseExists = courses.some(course => course.number === editedQuiz.courses);
      console.log('Course exists in dropdown options:', courseExists);
      
      if (!courseExists) {
        console.warn(`Warning: Course "${editedQuiz.courses}" not found in available courses`);
      }
      
      // Update the state variables
      setCurrentQuiz(editedQuiz);
      setEditing(true);
      
      // Scroll to the form
      document.querySelector('.form').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Error in handleEdit:', err);
      setError(`Error preparing quiz for edit: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteQuiz(id)
      fetchQuizzes()
    } catch (error) {
      console.error('Error deleting quiz:', error)
    }
  }

  return (
    <div className="page-container">
      <h2>Quizzes</h2>

      {/* {error && (
        <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
          Error: {error}
        </div>
      )}

      {(debugInfo || editing) && (
        <div className="debug-info" style={{ background: '#f5f5f5', padding: '10px', margin: '10px 0', border: '1px solid #ddd' }}>
          <h4>Debug Info {editing ? '(Editing Quiz)' : '(Data Sent to Server)'}</h4>
          <pre>{editing ? JSON.stringify(currentQuiz, null, 2) : debugInfo}</pre>
        </div>
      )} */}

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
            required
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
          <select
            name="courses"
            value={currentQuiz.courses}
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
          {editing && (
            <div className="form-hint" style={{ fontSize: '0.8rem', color: '#666' }}>
              Current course number: {currentQuiz.courses || 'None'}
            </div>
          )}
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
              courses: '', // Changed from courseId to courses
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
            setEditing(false)
          }}>Cancel</button>
        )}
      </form>

      <div className="list-container">
        <h3>Quiz List</h3>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Due Date</th>
              <th>Course</th>
              <th>Time Limit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map(quiz => (
              <tr key={quiz._id}>
                <td>{quiz.title}</td>
                <td>{quiz.description}</td>
                <td>{quiz.due}</td>
                <td>{quiz.courses}</td>
                <td>{quiz.timeLimit} min</td>
                <td>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleEdit(quiz);
                    }}
                    style={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      margin: '2px'
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(quiz._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default QuizPage
