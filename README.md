# E-Learning Platform

This repository contains a full-stack e-learning platform with a Node.js/Express backend API and a React frontend application.

## Project Structure

- `elearning/` - Latest backend API server (Node.js/Express)
- `elearning-app/` - Latest Frontend web application (React/Vite)
- `database/` - Sample data backup files for MongoDB database
- `query/` - query files for Task 5 and Task 6
- `documentation/` - Documentation files for milestone2: Task 3 ~ Task 6.

## Prerequisites

- Node.js v14+ and npm
- MongoDB (v4.4+)
- Git

## Setting Up the Database

***Update for Milestone 2***
- The database is hosted on MongoDB Atlas, and the connection string should be stored in the `.env` file.
- The `.env` file should be created in the root directory of the backend project: `elearning/`.
- Please find the environment variable in the comment of the submission on CANVAS. The connection string is not included in the repository for security reasons. When you run the program, please create a `.env` file in the `elearning/` directory, and copy the connection string from the comment to the `.env` file. Thank you!
- The database name is `elearning`, and the collections are `user`, `course`, `enrollment`, `assignment`, and `quizz`.


## Running the Backend API

1. Navigate to the backend directory:
   ```
   cd elearning
   ```


2. Start the server:
   ```
   npm start
   ```

The API will be available at http://localhost:4000/api

## Running the Frontend Application

1. Navigate to the frontend directory:
   ```
   cd elearning-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The web application will be available at http://localhost:5173

## Running queries for Task 5 and Task 6
1. Navigate to the query directory after running the backend server:
   ```
   cd elearning/query
   ```
2. Run the query files for Task 5 using the following command:
   ```
   node runQuery.js getInstructorCourseLoad
   node runQuery.js getStudentPerformanceAnalytics
   node runQuery.js getCourseContentAnalysis
   node runQuery.js getDepartmentAnalytics
   ```
3. To run the index optimization script (Task 6), first make sure you are in the `elearning/query` directory and have the required MongoDB connection string in your `.env` file.

4. Then run the index optimization operations:
   ```
   # To create indexes:
   node runIndexOptimization.js create-indexes

   # To run performance benchmarks:
   node runIndexOptimization.js benchmark

   # To generate query explain plans:
   node runIndexOptimization.js explain
   ```

5. The results will be printed in the console.

## API Endpoints

The backend provides the following main API endpoints:

- Users: `/api/users`
- Courses: `/api/courses`
- Enrollments: `/api/enrollments`
- Assignments: `/api/assignments`
- Quizzes: `/api/quizzes`


## Development

- Backend code is organized by feature (users, courses, enrollments, etc.)
- Each feature has its own directory with model, schema, DAO (Data Access Object), and routes
- Frontend uses React with React Router for navigation and Axios for API communication


### Usernames and passwords for testing:
- **Admin**: 
  - Username: admin_johnson
  - Password: defaultPassword123
- **Faculty**:
   - Username: prof_williams
   - Password: defaultPassword123
- **Student**:
   - Username: emma_smith
   - Password: defaultPassword123
