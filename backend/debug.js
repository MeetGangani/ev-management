import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';

dotenv.config();

const debugDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected'.green.underline);
    
    // Get the users collection
    const usersCollection = mongoose.connection.db.collection('users');
    
    // Get all indexes on the users collection
    const indexes = await usersCollection.indexes();
    console.log('===== COLLECTION INDEXES ====='.green);
    console.log(JSON.stringify(indexes, null, 2));
    
    // Get a sample user
    const sampleUsers = await usersCollection.find({}).limit(3).toArray();
    console.log('\n===== SAMPLE USERS ====='.green);
    console.log(JSON.stringify(sampleUsers.map(user => {
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        aadhaar: user.aadhaar === undefined ? 'undefined' : user.aadhaar,
        aadharNumber: user.aadharNumber === undefined ? 'undefined' : user.aadharNumber
      };
    }), null, 2));
    
    // Count null/undefined aadhaar values
    const nullAadhaarCount = await usersCollection.countDocuments({ aadhaar: null });
    const undefinedAadhaarCount = await usersCollection.countDocuments({ aadhaar: { $exists: false } });
    console.log('\n===== AADHAAR FIELD STATS ====='.green);
    console.log(`Records with aadhaar = null: ${nullAadhaarCount}`);
    console.log(`Records with aadhaar field missing: ${undefinedAadhaarCount}`);
    
    // Check for aadharNumber field (potential schema mismatch)
    const nullAadharNumberCount = await usersCollection.countDocuments({ aadharNumber: null });
    const undefinedAadharNumberCount = await usersCollection.countDocuments({ aadharNumber: { $exists: false } });
    console.log('\n===== AADHARNUMBER FIELD STATS ====='.green);
    console.log(`Records with aadharNumber = null: ${nullAadharNumberCount}`);
    console.log(`Records with aadharNumber field missing: ${undefinedAadharNumberCount}`);
    
    // Drop the problematic index if it exists
    console.log('\n===== FIXING INDEXES ====='.green);
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
    
    // Create a new sparse index
    await usersCollection.createIndex({ aadhaar: 1 }, { 
      unique: true, 
      sparse: true,
      partialFilterExpression: { aadhaar: { $type: "string" } }
    });
    console.log('Created new sparse index on aadhaar field'.green);
    
    // Confirm indexes after changes
    const newIndexes = await usersCollection.indexes();
    console.log('\n===== UPDATED INDEXES ====='.green);
    console.log(JSON.stringify(newIndexes, null, 2));
    
    mongoose.disconnect();
    console.log('\nDebug complete. MongoDB disconnected.'.green);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

debugDB(); 