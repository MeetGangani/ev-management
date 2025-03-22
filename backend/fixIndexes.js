import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';

dotenv.config();

const fixIndexes = async () => {
  try {
    // Connect directly with the MongoDB connection string
    const mongoURI = process.env.MONGO_URI;
    console.log(`Connecting to MongoDB...`);
    
    if (!mongoURI) {
      console.log('MONGO_URI is not defined in .env file.'.red);
      console.log('Please define MONGO_URI in your .env file.'.yellow);
      process.exit(1);
    }
    
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected'.green);
    
    // Get the users collection
    const usersCollection = mongoose.connection.db.collection('users');
    
    // Get all indexes on the users collection
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:');
    console.log(indexes);
    
    // Try to drop any problematic indexes
    try {
      await usersCollection.dropIndex('aadhaar_1');
      console.log('Successfully dropped aadhaar_1 index'.green);
    } catch (err) {
      console.log('No aadhaar_1 index to drop or error dropping index'.yellow);
    }

    try {
      await usersCollection.dropIndex('aadharNumber_1');
      console.log('Successfully dropped aadharNumber_1 index'.green);
    } catch (err) {
      console.log('No aadharNumber_1 index to drop or error dropping index'.yellow);
    }
    
    // Create a new proper sparse index
    await usersCollection.createIndex(
      { aadhaar: 1 }, 
      { 
        unique: true, 
        sparse: true,
        background: true,
        name: 'aadhaar_sparse_index'
      }
    );
    console.log('Created new sparse index on aadhaar field'.green);
    
    // Check the indexes again
    const newIndexes = await usersCollection.indexes();
    console.log('Updated indexes:');
    console.log(newIndexes);
    
    console.log('Index fix completed successfully'.green);
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`.red);
    process.exit(1);
  }
};

fixIndexes(); 