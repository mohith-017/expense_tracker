// File: server/config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // useNewUrlParser and useUnifiedTopology are deprecated in newer mongoose versions
    // Mongoose 6+ handles these automatically.
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;