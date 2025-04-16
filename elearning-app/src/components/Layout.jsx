import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import '../styles/Layout.css' // Import the CSS file

function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Function to handle clicking on Users tab
  const handleUsersClick = (e) => {
    // If user is not admin, prevent the default navigation and redirect to account page
    if (user && user.role !== 'ADMIN') {
      e.preventDefault();
      navigate('/account');
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>E-Learning Platform</h1>
        <div className="user-info">
          {user ? (
            <>
              <span>Welcome, {user.firstName || user.username}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <NavLink to="/login">Login</NavLink>
          )}
        </div>
      </header>
      <div className="content-container">
        <nav>
          <ul>
            <li><NavLink to="/courses">Courses</NavLink></li>
            {/* Removed Assignments link from navigation menu */}
            {/* Add click handler to Users tab */}
            <li><NavLink to="/users" onClick={handleUsersClick}>Users</NavLink></li>
            <li><NavLink to="/enrollments">Enrollments</NavLink></li>
            <li><NavLink to="/account">My Account</NavLink></li>
          </ul>
        </nav>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
