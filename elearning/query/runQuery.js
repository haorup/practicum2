import mongoose from 'mongoose';
import advancedQueries from './advancedQueries.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct location
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Get the MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI

async function runQuery(queryName) {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
      }
    });
    console.log('Connected to MongoDB successfully!');
    
    // Check if the requested query exists
    if (!advancedQueries[queryName]) {
      console.error(`Query '${queryName}' not found.`);
      console.log('Available queries:');
      Object.keys(advancedQueries).forEach(key => console.log(`- ${key}`));
      return;
    }
    
    // Execute the query
    console.log(`Running query: ${queryName}...`);
    const results = await advancedQueries[queryName]();
    
    // Display results
    console.log('\nResults:');
    console.log(JSON.stringify(results, null, 2));
    console.log(`\nFound ${results.length} results.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Get the query name from command line arguments
const queryName = process.argv[2];

if (!queryName) {
  console.log('Please provide a query name as a command line argument.');
  console.log('Available queries:');
  Object.keys(advancedQueries).forEach(key => console.log(`- ${key}`));
} else {
  runQuery(queryName);
}
