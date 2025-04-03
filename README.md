# E-Learning Platform

This repository contains a full-stack e-learning platform with a Node.js/Express backend API and a React frontend application.

## Project Structure

- `elearning/` - Backend API server (Node.js/Express)
- `elearning-app/` - Frontend web application (React/Vite)

## Prerequisites

- Node.js v14+ and npm
- MongoDB (v4.4+)
- Git

## Setting Up the Database

1. Install MongoDB if you haven't already:

2. Start MongoDB:
   ```
   mongod --dbpath /path/to/data/directory
   ```

3. The application will automatically create the required database and collections when it first runs.

## Running the Backend API

1. Navigate to the backend directory:
   ```
   cd elearning
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
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

## API Endpoints

The backend provides the following main API endpoints:

- Users: `/api/users`
- Courses: `/api/courses`
- Enrollments: `/api/enrollments`
- Assignments: `/api/assignments`
- Quizzes: `/api/quizzes`

## Importing Data to MongoDB

There are two ways to import initial data to MongoDB:

### Using MongoDB Compass (GUI)

MongoDB Compass is a graphical user interface for MongoDB that makes it easy to import data visually.

1. Download and install MongoDB Compass 

2. Connect to your MongoDB instance:
   - Open MongoDB Compass
   - Enter the connection string: `mongodb://localhost:27017`
   - Click "Connect"

3. Import data:
   - Create a new database named "elearning" if it doesn't exist
   - Create collections matching your schema names ("users", "courses", "assignments", "quizzes")
   - For each collection:
     - Select the collection
     - Click on "Add Data" dropdown button
     - Choose "Import File"
     - Select the file from the `/database` directory
     - Choose JSON format
     - Click "Import"

4. Verify the data:
   - Click on each collection
   - You should see the imported documents displayed in the Compass interface



## Development

- Backend code is organized by feature (users, courses, enrollments, etc.)
- Each feature has its own directory with model, schema, DAO (Data Access Object), and routes
- Frontend uses React with React Router for navigation and Axios for API communication

## Building for Production

### Backend
```
cd elearning
npm start
```

### Frontend
```
cd elearning-app
npm run build
```

The built frontend will be available in the `elearning-app/dist` directory, which can be served by any static file server.