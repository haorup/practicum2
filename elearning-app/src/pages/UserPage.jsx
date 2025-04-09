import { useState, useEffect } from 'react'
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService'

function UserPage() {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState({ firstName: '', lastName: '', email: '', role: 'STUDENT' })
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await getUsers()
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleInputFirstName = (e) => {
    const { value } = e.target
    setCurrentUser({ ...currentUser, firstName: value })
  }

  const handleInputLastName = (e) => {
    const { value } = e.target
    setCurrentUser({ ...currentUser, lastName: value })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentUser({ ...currentUser, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Add required fields for user creation
      const userToSubmit = {
        ...currentUser,
        username: currentUser.email.split('@')[0] || `user_${Date.now()}`,
        password: 'defaultPassword123',
        userID: parseInt(Date.now().toString().slice(-9)), // Create numeric ID from timestamp
        lastActivity: new Date()
      };
      
      if (editing) {
        await updateUser(currentUser._id, userToSubmit);
      } else {
        await createUser(userToSubmit);
      }
      
      setCurrentUser({ firstName: '', lastName: '', email: '', role: 'STUDENT' });
      setEditing(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleEdit = (user) => {
    setCurrentUser(user)
    setEditing(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteUser(id)
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  return (
    <div className="page-container">
      <h2>Users</h2>
      
      <form onSubmit={handleSubmit} className="form">
        <h3>{editing ? 'Edit User' : 'Add New User'}</h3>
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={currentUser.firstName}
            onChange={handleInputFirstName}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={currentUser.lastName}
            onChange={handleInputLastName}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={currentUser.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select
            name="role"
            value={currentUser.role}
            onChange={handleInputChange}
            required
          >
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <button type="submit">
          {editing ? 'Update' : 'Create'}
        </button>
        {editing && (
          <button type="button" onClick={() => {
            setCurrentUser({ firstName: '', lastName: '', email: '', role: 'STUDENT' })
            setEditing(false)
          }}>Cancel</button>
        )}
      </form>

      <div className="list-container">
        <h3>User List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.firstName +" "+ user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleEdit(user)}>Edit</button>
                  <button onClick={() => handleDelete(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserPage
