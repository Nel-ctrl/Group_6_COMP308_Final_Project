const mongoose = require('mongoose');

/**
 * Connect to a MongoDB database.
 * Each microservice calls this with its own database name,
 * so services are isolated at the database level.
 */
async function connectDB(dbName) {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';

  try {
    await mongoose.connect(uri, { dbName });
    console.log(`Connected to MongoDB database: ${dbName}`);
  } catch (error) {
    console.error(`Failed to connect to MongoDB (${dbName}):`, error.message);
    process.exit(1);
  }
}

module.exports = { connectDB, mongoose };
