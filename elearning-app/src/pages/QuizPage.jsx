import { useState, useEffect } from 'react'
import { getQuizzes, createQuiz, updateQuiz, deleteQuiz } from '../services/quizService'
import { getCourses } from '../services/courseService'

function QuizPage() {
  const [quizzes, setQuizzes] = useState([])
  const [currentQuiz, setCurrentQuiz] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    courseId: '',
    timeLimit: 60
  })
  const [editing, setEditing] = useState(false)
  const [courses, setCourses] = useState([])

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
    try {
      if (editing) {
        await updateQuiz(currentQuiz._id, currentQuiz)
      } else {
        await createQuiz(currentQuiz)
      }
      setCurrentQuiz({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        courseId: '',
        timeLimit: 60
      })
      setEditing(false)
      fetchQuizzes()
    } catch (error) {
      console.error('Error saving quiz:', error)
    }
  }

  const handleEdit = (quiz) => {
    setCurrentQuiz({
      ...quiz,
      dueDate: new Date(quiz.dueDate).toISOString().split('T')[0]
    })
    setEditing(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteQuiz(id)
      fetchQuizzes()
    } catch (error) {
      console.error('Error deleting quiz:', error)
    }
  }

  // Helper function to find course title by ID
  const getCourseTitle = (id) => {
    const course = courses.find(course => course._id === id)
    return course ? course.title : 'Unknown'
  }

  return (
    <div className="page-container">
      <h2>Quizzes</h2>
      
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
            name="courseId"
            value={currentQuiz.courseId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
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
        <button type="submit">{editing ? 'Update' : 'Create'}</button>
        {editing && (
          <button type="button" onClick={() => {
            setCurrentQuiz({
              title: '',
              description: '',
              dueDate: new Date().toISOString().split('T')[0],
              courseId: '',
              timeLimit: 60
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
                  <button onClick={() => handleEdit(quiz)}>Edit</button>
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
