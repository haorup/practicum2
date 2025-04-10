import { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/AuthService';

// Create the context
export const UserContext = createContext(null);

// Create the provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data when the component mounts
  useEffect(() => {
    const loadUser = () => {
      try {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
          setUser({
            id: currentUser.id,
            username: currentUser.username,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            role: currentUser.role,
            joinDate: new Date().toLocaleDateString()
          });
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const userData = await AuthService.login(username, password);
      setUser({
        id: userData.id,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        joinDate: new Date().toLocaleDateString()
      });
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // First update the state
    setUser(null);
    // Then clear the localStorage
    AuthService.logout();
    // For debugging
    console.log("User logged out, user state cleared");
  };

  // Update user information
  const updateUser = (newUserData) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...newUserData };
      
      // If you want to persist these changes to localStorage
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          ...newUserData
        }));
      }
      
      return updatedUser;
    });
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
