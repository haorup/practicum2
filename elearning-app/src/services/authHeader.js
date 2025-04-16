export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (user) {
    // Return the token using whatever property name is available
    const token = user.token || user.accessToken;
    
    if (token) {
      return { 
        'Authorization': 'Bearer ' + token,
        'x-user-role': user.role // Include user role in headers
      };
    }
  }
  
  return {};
}
