import mongoose from 'mongoose';
import indexOptimization from './indexOptimization.js';
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

async function runIndexOptimization(operation) {
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
    
    // Execute the requested operation
    switch (operation) {
      case 'create-indexes':
        console.log('Creating database indexes...');
        await indexOptimization.createAllIndexes();
        break;
        
      case 'benchmark':
        console.log('Running performance benchmarks...');
        const benchmarkResults = await indexOptimization.runPerformanceBenchmarks();
        console.log('\nBenchmark Results:');
        console.log(JSON.stringify(benchmarkResults, null, 2));
        break;
        
      case 'explain':
        console.log('Generating explain plans...');
        const explainPlans = await indexOptimization.generateExplainPlans();
        console.log('\nExplain Plan Results:');
        // Only show essential parts of the explain plans to avoid console overflow
        for (const [queryName, plan] of Object.entries(explainPlans)) {
          console.log(`\n${queryName}:`);
          console.log(`- Documents examined: ${plan.executionStats?.totalDocsExamined || 'N/A'}`);
          console.log(`- Execution time (ms): ${plan.executionStats?.executionTimeMillis || 'N/A'}`);
          console.log(`- Index used: ${plan.queryPlanner?.winningPlan?.inputStage?.indexName || 'None'}`);
        }
        break;
        
      default:
        console.log('Invalid operation. Available operations:');
        console.log('- create-indexes: Create all database indexes');
        console.log('- benchmark: Run performance benchmarks');
        console.log('- explain: Generate query explain plans');
        break;
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Get the operation from command line arguments
const operation = process.argv[2];

if (!operation) {
  console.log('Please provide an operation:');
  console.log('node runIndexOptimization.js create-indexes');
  console.log('node runIndexOptimization.js benchmark');
  console.log('node runIndexOptimization.js explain');
} else {
  runIndexOptimization(operation);
}
