import React, { useState } from 'react';
import authHeader from '../services/authHeader';

export function DebugAuth() {
  const [debugInfo, setDebugInfo] = useState("");
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = authHeader();
  
  const testAuth = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      console.log("Testing auth with URL:", `${API_URL}/enrollments/test-auth`);
      
      const response = await fetch(`${API_URL}/enrollments/test-auth`, {
        headers: {
          ...headers
        }
      });
      
      const data = await response.json();
      console.log("Auth test response:", data);
      
      if (response.ok) {
        setDebugInfo(`Auth success! User ID: ${data.userId}, Role: ${data.userRole}`);
      } else {
        setDebugInfo(`Auth failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Auth test error:", error);
      setDebugInfo(`Error testing auth: ${error.message}`);
    }
  };
  
  // Examine token structure
  let tokenInfo = "No token found";
  if (user && (user.token || user.accessToken)) {
    const token = user.token || user.accessToken;
    try {
      const [header, payload, signature] = token.split('.');
      const decodedHeader = JSON.parse(atob(header));
      const decodedPayload = JSON.parse(atob(payload));
      
      tokenInfo = (
        <div>
          <p><strong>Header:</strong> {JSON.stringify(decodedHeader)}</p>
          <p><strong>Payload:</strong> {JSON.stringify(decodedPayload)}</p>
          <p><strong>Expires:</strong> {new Date(decodedPayload.exp * 1000).toLocaleString()}</p>
        </div>
      );
    } catch (error) {
      tokenInfo = `Error decoding token: ${error.message}`;
    }
  }

  return (
    <div style={{padding: '10px', border: '1px solid #ccc', margin: '10px 0', background: '#f9f9f9'}}>
      <h3>Auth Debug Panel</h3>
      <div>
        <strong>User in localStorage:</strong>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
      <div>
        <strong>Auth Headers:</strong>
        <pre>{JSON.stringify(headers, null, 2)}</pre>
      </div>
      <div>
        <strong>Token Analysis:</strong>
        <div>{tokenInfo}</div>
      </div>
      <button onClick={testAuth}>Test Authentication</button>
      {debugInfo && (
        <div style={{marginTop: '10px', padding: '10px', backgroundColor: debugInfo.includes('success') ? '#d4edda' : '#f8d7da'}}>
          {debugInfo}
        </div>
      )}
    </div>
  );
}
