import axios from 'axios';

const API_URL = 'http://localhost:4000/api/auth/';

class AuthService {
  async login(username, password) {
    try {
      const response = await axios.post(API_URL + 'login', { username, password });
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('user');
  }

  register(username, email, password, firstName, lastName) {
    return axios.post(API_URL + 'register', {
      username,
      email,
      password,
      firstName,
      lastName
    });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  isAuthenticated() {
    const user = this.getCurrentUser();
    return !!user && !!user.token;
  }

  // Helper to set auth header for protected API calls
  authHeader() {
    const user = this.getCurrentUser();
    
    if (user && user.token) {
      return { Authorization: 'Bearer ' + user.token };
    } else {
      return {};
    }
  }
}

export default new AuthService();