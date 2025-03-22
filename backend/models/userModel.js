import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'stationMaster', 'admin'],
      default: 'customer',
    },
    phone: {
      type: String,
      default: '',
    },
    aadhaar: {
      type: String,
      validate: {
        validator: function(v) {
          // Only validate aadhaar if it's provided or if the user is a customer
          if (!v && this.role !== 'customer') return true;
          return /^\d{12}$/.test(v);
        },
        message: props => `${props.value} is not a valid Aadhar number!`
      }
    },
    aadharVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Remove any existing indexes on aadhaar
// This code will try to drop any existing problematic indexes when Mongoose initializes
try {
  if (mongoose.connection.readyState === 1) { // If already connected
    mongoose.connection.db.collection('users').dropIndex('aadhaar_1').catch(() => {});
  }
} catch (err) {
  // Ignore errors - index might not exist
}

// Add a sparse unique index for aadhaar that allows multiple documents with null/undefined values
userSchema.index({ aadhaar: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { aadhaar: { $type: "string" } }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
