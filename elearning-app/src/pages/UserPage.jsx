import { useState, useEffect } from 'react'
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService'

function UserPage() {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState({ name: '', email: '', role: 'student' })
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentUser({ ...currentUser, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await updateUser(currentUser._id, currentUser)
      } else {
        await createUser(currentUser)
      }
      setCurrentUser({ name: '', email: '', role: 'student' })
      setEditing(false)
      fetchUsers()
    } catch (error) {
      console.error('Error saving user:', error)
    }
  }

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
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={currentUser.name}
            onChange={handleInputChange}
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
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">{editing ? 'Update' : 'Create'}</button>
        {editing && (
          <button type="button" onClick={() => {
            setCurrentUser({ name: '', email: '', role: 'student' })
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
