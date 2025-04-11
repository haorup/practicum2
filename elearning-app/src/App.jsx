import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import CoursePage from './pages/CoursePage'
import AssignmentPage from './pages/AssignmentPage'
import QuizPage from './pages/QuizPage'
import UserPage from './pages/UserPage'
import EnrollmentPage from './pages/EnrollmentPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import AuthService from './services/AuthService'
import Account from './pages/Account'
import { UserProvider, useUser } from './context/UserContext'
import { useEffect } from 'react'

// Protected route component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const location = useLocation();
  
  useEffect(() => {
    // For debugging - remove this in production
    console.log(`Checking auth for path: ${location.pathname}, authenticated: ${isAuthenticated}`);
  }, [location, isAuthenticated]);
  
  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} />;
};

// Admin-only route component
const AdminRoute = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const user = AuthService.getCurrentUser();
  const isAdmin = user && user.role === 'ADMIN';
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }
  
  return isAdmin ? children : <Navigate to="/account" />;
};

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Redirect root to login if not authenticated */}
        <Route path="/" element={
          AuthService.isAuthenticated() ? 
          <Navigate to="/courses" /> : 
          <Navigate to="/login" />
        } />
        
        {/* Layout wrapper for all protected routes */}
        <Route element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route path="courses" element={<CoursePage />} />
          <Route path="assignments" element={<Navigate to="/courses" />} />
          <Route path="assignments/:courseNumber" element={<AssignmentPage />} />
          <Route path="quizzes" element={<Navigate to="/courses" />} />
          <Route path="quizzes/:courseNumber" element={<QuizPage />} />
          {/* Make Users page admin-only */}
          <Route path="users" element={
            <AdminRoute>
              <UserPage />
            </AdminRoute>
          } />
          <Route path="enrollments" element={<EnrollmentPage />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Routes>
    </UserProvider>
  )
}

export default App
