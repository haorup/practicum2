import mongoose from "mongoose";

/**
 * Execute operations within a MongoDB transaction
 * @param {Function} operations - Async function that takes a session and performs DB operations
 * @returns {Promise} - Result of the operations
 */
export const withTransaction = async (operations) => {
  // Start a session
  const session = await mongoose.startSession();
  
  try {
    let result;
    
    // Start a transaction
    await session.withTransaction(async () => {
      // Execute the operations within the transaction
      result = await operations(session);
    });
    
    return result;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw new Error(`Transaction failed: ${error.message}`);
  } finally {
    // End the session
    await session.endSession();
  }
};
