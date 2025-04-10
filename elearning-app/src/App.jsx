import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import CoursePage from './pages/CoursePage'
import AssignmentPage from './pages/AssignmentPage'
import QuizPage from './pages/QuizPage'
import UserPage from './pages/UserPage'
import EnrollmentPage from './pages/EnrollmentPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import AuthService from './services/AuthService'

// Protected route component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Redirect root to login if not authenticated */}
      <Route path="/" element={
        AuthService.isAuthenticated() ? 
        <Navigate to="/courses" /> : 
        <Navigate to="/login" />
      } />
      
      {/* Protected routes */}
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
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
