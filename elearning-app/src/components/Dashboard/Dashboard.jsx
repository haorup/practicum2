import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import AuthService from '../../services/AuthService';
import './Dashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = 'http://localhost:4000/api';

const Dashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = AuthService.authHeader();
        
        if (!headers.Authorization) {
          throw new Error('No authentication token found');
        }

        const [studentResponse, courseResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/analytics/student-performance`, { headers }),
          axios.get(`${API_BASE_URL}/analytics/course-analytics`, { headers })
        ]);

        setStudentData(studentResponse.data);
        setCourseData(courseResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (err.response?.status === 401) {
          AuthService.logout();
          window.location.href = '/login';
        } else {
          setError('Failed to fetch dashboard data: ' + (err.response?.data?.message || err.message));
        }
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="dashboard-loading">Loading...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  // User role distribution data
  const roleDistributionData = {
    labels: studentData?.labels || [],
    datasets: [
      {
        label: 'User Count',
        data: studentData?.counts || [],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
      },
    ],
  };

  // Department course distribution data
  const departmentData = {
    labels: courseData?.departmentLabels || [],
    datasets: [
      {
        label: 'Course Count',
        data: courseData?.departmentCourseData || [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Student Count',
        data: courseData?.departmentStudentData || [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ],
  };

  // Credit distribution data
  const creditDistributionData = {
    labels: courseData?.creditLabels || [],
    datasets: [
      {
        data: courseData?.creditData || [],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <h1>E-Learning System Analytics</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{studentData?.totalUsers || 0}</p>
          <small>Students: {studentData?.counts?.[0] || 0}</small>
        </div>
        <div className="stat-card">
          <h3>Total Courses</h3>
          <p>{courseData?.totalCourses || 0}</p>
          {/* <small>Active Courses: {courseData?.activeCourses || 0}</small> */}
        </div>
        <div className="stat-card">
          <h3>Credit Types</h3>
          <p>{courseData?.creditLabels?.length || 0}</p>
          {/* <small>Total Courses: {courseData?.totalCourses || 0}</small> */}
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h2>User Role Distribution</h2>
          <Bar 
            data={roleDistributionData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'User Count by Role' }
              }
            }}
          />
        </div>

        <div className="chart-container">
          <h2>Department Statistics</h2>
          <Bar
            data={departmentData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Course and Student Distribution by Department' }
              }
            }}
          />
        </div>

        <div className="chart-container">
          <h2>Credit Distribution</h2>
          <Doughnut
            data={creditDistributionData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Course Distribution by Credits' }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 