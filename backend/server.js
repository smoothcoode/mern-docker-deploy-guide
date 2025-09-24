const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Importing Env variables 
const MONGO_USER = process.env.MONGO_USER || "admin";
const MONGO_PASS = process.env.MONGO_PASS || "admin";
const MONGO_HOST = process.env.MONGO_HOST || "localhost";
const MONGO_PORT = process.env.MONGO_PORT || "27017";
const MONGO_DB   = process.env.MONGO_DB   || "notesdb";
const PORT = process.env.PORT || 5000 ;

const MONGODB_URI = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

// Database connection function with verification
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
    
    // Verify connection by checking if the connection is established
    const db = mongoose.connection;
    
    db.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
    
    db.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    // Return the connection status
    return { 
      success: true, 
      message: 'MongoDB connected successfully',
      connectionState: mongoose.connection.readyState 
    };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    return { 
      success: false, 
      message: `Failed to connect to MongoDB: ${error.message}`,
      connectionState: mongoose.connection.readyState 
    };
  }
};

// Function to check current database connection status
const checkDBConnection = () => {
  const state = mongoose.connection.readyState;
  let status = '';
  
  switch(state) {
    case 0:
      status = 'disconnected';
      break;
    case 1:
      status = 'connected';
      break;
    case 2:
      status = 'connecting';
      break;
    case 3:
      status = 'disconnecting';
      break;
    default:
      status = 'unknown';
  }
  
  return {
    state: state,
    status: status,
    isConnected: state === 1
  };
};

// Note Schema
const noteSchema = new mongoose.Schema({
  text: String
});

const Note = mongoose.model('Note', noteSchema);



// CRUD Routes with connection verification
app.get('/api/notes', async (req, res) => {
  if (!checkDBConnection().isConnected) {
    return res.status(500).json({ error: 'Database not connected' });
  }
  
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notes', async (req, res) => {
  if (!checkDBConnection().isConnected) {
    return res.status(500).json({ error: 'Database not connected' });
  }
  
  try {
    const newNote = new Note({ text: req.body.text });
    await newNote.save();
    res.json(newNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  if (!checkDBConnection().isConnected) {
    return res.status(500).json({ error: 'Database not connected' });
  }
  
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connect to database and start server
const startServer = async () => {
  try {
    const connectionResult = await connectDB();
    console.log(connectionResult.message);
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

// Start the application
startServer();