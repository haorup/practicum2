import { useState, useEffect } from 'react'
import { getEnrollments, createEnrollment, updateEnrollment, deleteEnrollment } from '../services/enrollmentService'
import { getUsers } from '../services/userService'
import { getCourses } from '../services/courseService'
import { useUser } from '../context/UserContext'
import { FaEdit, FaTrash } from 'react-icons/fa'
import '../styles/EnrollmentPage.css'

function EnrollmentPage() {
  const [enrollments, setEnrollments] = useState([])
  const [currentEnrollment, setCurrentEnrollment] = useState({
    user: '',
    course: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE'
  })
  const [editing, setEditing] = useState(false)
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const { user: currentUser } = useUser();

  useEffect(() => {
    // Check if user is available before making requests
    if (currentUser) {
      fetchEnrollments();
      fetchUsers();
      fetchCourses();
    }
  }, [currentUser]);

  const fetchEnrollments = async () => {
    try {
      const response = await getEnrollments();
      
      // Filter enrollments based on user role
      let filteredEnrollments = response.data;
      
      if (currentUser && currentUser.role === 'STUDENT') {
        // Students can only see their own enrollments
        filteredEnrollments = response.data.filter(
          enrollment => {
            // Handle both object and ID reference formats
            const userId = typeof enrollment.user === 'object' ? 
              enrollment.user._id : enrollment.user;
            return userId === currentUser.id;
          }
        );
        
        // For student view, ensure the current user info is properly populated in each enrollment
        filteredEnrollments = filteredEnrollments.map(enrollment => {
          // If user is not populated or has missing fields
          if (!enrollment.user || typeof enrollment.user !== 'object' || 
              !enrollment.user.firstName || !enrollment.user.lastName) {
            return {
              ...enrollment,
              user: {
                _id: currentUser.id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                ...((typeof enrollment.user === 'object') ? enrollment.user : {})
              }
            };
          }
          return enrollment;
        });
      }
      
      setEnrollments(filteredEnrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      // Filter for students only
      const students = response.data.filter(user => user.role === 'STUDENT');
      setUsers(students);
    } catch (error) {
      console.error('Error fetching users:', error);
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
    setCurrentEnrollment({ ...currentEnrollment, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only allow ADMIN to create/update enrollments
    if (currentUser.role !== 'ADMIN') {
      alert('You do not have permission to perform this action.');
      return;
    }
    
    try {
      if (editing) {
        const response = await updateEnrollment(currentEnrollment._id, currentEnrollment);
      } else {
        const response = await createEnrollment(currentEnrollment);
      }
      
      setCurrentEnrollment({
        user: '',
        course: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
      });
      setEditing(false);
      fetchEnrollments();
    } catch (error) {
      console.error('Error saving enrollment:', error);
      
      // Handle transaction failure specifically
      if (error.response && error.response.data && error.response.data.transactionFailed) {
        alert(`Transaction failed: ${error.response.data.message}`);
      } else {
        alert(`Error: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleEdit = (enrollment) => {
    // Only allow ADMIN to edit enrollments
    if (currentUser.role !== 'ADMIN') {
      alert('You do not have permission to perform this action.');
      return;
    }
    
    // Create a copy of the enrollment to modify
    const enrollmentToEdit = { ...enrollment };
    
    // Format the date correctly for the date input (yyyy-MM-dd)
    if (enrollmentToEdit.enrollmentDate) {
      const date = new Date(enrollmentToEdit.enrollmentDate);
      // Use local date components to avoid timezone issues
      const year = date.getFullYear();
      // Month is 0-based in JavaScript (0 = January)
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      enrollmentToEdit.enrollmentDate = `${year}-${month}-${day}`;
    }
    
    // Make sure we use the IDs for the dropdowns, not the objects
    if (typeof enrollmentToEdit.user === 'object' && enrollmentToEdit.user !== null) {
      enrollmentToEdit.user = enrollmentToEdit.user._id;
    }
    
    if (typeof enrollmentToEdit.course === 'object' && enrollmentToEdit.course !== null) {
      enrollmentToEdit.course = enrollmentToEdit.course._id;
    }
    
    setCurrentEnrollment(enrollmentToEdit);
    setEditing(true);
  };

  const handleDelete = async (id) => {
    // Only allow ADMIN to delete enrollments
    if (currentUser.role !== 'ADMIN') {
      alert('You do not have permission to perform this action.');
      return;
    }
    
    try {
      await deleteEnrollment(id);
      fetchEnrollments();
    } catch (error) {
      console.error('Error deleting enrollment:', error);
    }
  };

  // Determine if the user can modify enrollments (ADMIN only)
  const canModifyEnrollments = currentUser && currentUser.role === 'ADMIN';
  
  // Determine if user can see all enrollments (ADMIN or FACULTY)
  const canSeeAllEnrollments = currentUser && 
    (currentUser.role === 'ADMIN' || currentUser.role === 'FACULTY');

  return (
    <div className="page-container">
      <h2>Enrollments</h2>
      
      {/* Display different messages based on role */}
      <div className="role-indicator">
        {currentUser && currentUser.role === 'ADMIN' && <p className="role-badge admin">Administrator View (Full Access)</p>}
        {currentUser && currentUser.role === 'FACULTY' && <p className="role-badge faculty">Faculty View (Read Only)</p>}
        {currentUser && currentUser.role === 'STUDENT' && <p className="role-badge student">Student View (Personal Enrollments Only)</p>}
      </div>
      
      {/* Only show the form to ADMIN users */}
      {canModifyEnrollments && (
        <form onSubmit={handleSubmit} className="form">
          <h3>{editing ? 'Edit Enrollment' : 'Add New Enrollment'}</h3>
          <div className="form-group">
            <label>Student</label>
            <select
              name="user"
              value={currentEnrollment.user}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a student</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.firstName + " " + user.lastName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Course</label>
            <select
              name="course"
              value={currentEnrollment.course}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Enrollment Date</label>
            <input
              type="date"
              name="enrollmentDate"
              value={currentEnrollment.enrollmentDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={currentEnrollment.status}
              onChange={handleInputChange}
              required
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="DROPPED">Dropped</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <button type="submit">{editing ? 'Update' : 'Create'}</button>
          {editing && (
            <button type="button" onClick={() => {
              setCurrentEnrollment({
                user: '',
                course: '',
                enrollmentDate: new Date().toISOString().split('T')[0],
                status: 'ACTIVE'
              });
              setEditing(false);
            }}>Cancel</button>
          )}
        </form>
      )}

      <div className="list-container">
        <h3>
          {currentUser && currentUser.role === 'STUDENT' ? 'My Enrollments' : 'Enrollment List'}
        </h3>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Course Number</th>
              <th>Enrollment Date</th>
              <th>Status</th>
              {canModifyEnrollments && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {enrollments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{textAlign: 'center'}}>No enrollments found</td>
              </tr>
            ) : (
              enrollments.map(enrollment => {
                // Ensure user data exists and has firstName/lastName
                const userFirstName = enrollment.user?.firstName || currentUser?.firstName || 'Unknown';
                const userLastName = enrollment.user?.lastName || currentUser?.lastName || 'User';
                
                return (
                  <tr key={enrollment._id}>
                    <td>{userFirstName + " " + userLastName}</td>
                    <td>{enrollment.course?.name || 'Unknown Course'}</td>
                    <td>{enrollment.course?.number || 'N/A'}</td>
                    <td>{enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{enrollment.status}</td>
                    {canModifyEnrollments && (
                      <td>
                        <FaEdit onClick={() => handleEdit(enrollment)}/>
                        <FaTrash onClick={() => handleDelete(enrollment._id)}/>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EnrollmentPage
