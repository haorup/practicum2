import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import CoursePage from './pages/CoursePage'
import AssignmentPage from './pages/AssignmentPage'
import QuizPage from './pages/QuizPage'
import UserPage from './pages/UserPage'
import EnrollmentPage from './pages/EnrollmentPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<CoursePage />} />
        <Route path="courses" element={<CoursePage />} />
        <Route path="assignments" element={<AssignmentPage />} />
        <Route path="quizzes" element={<QuizPage />} />
        <Route path="users" element={<UserPage />} />
        <Route path="enrollments" element={<EnrollmentPage />} />
      </Route>
    </Routes>
  )
}

export default App
