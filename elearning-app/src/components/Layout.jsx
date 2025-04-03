import { Link, Outlet } from 'react-router-dom'

function Layout() {
  return (
    <div className="app-container">
      <header>
        <nav>
          <h1>E-Learning Platform</h1>
          <ul>
            <li><Link to="/courses">Courses</Link></li>
            <li><Link to="/assignments">Assignments</Link></li>
            <li><Link to="/quizzes">Quizzes</Link></li>
            <li><Link to="/users">Users</Link></li>
            <li><Link to="/enrollments">Enrollments</Link></li>
          </ul>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
