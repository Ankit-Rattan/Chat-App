// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport'); // Ensure correct path

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use(
  session({ secret: 'your-secret-key', resave: true, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

const chatMessageSchema = new mongoose.Schema({
  user: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

io.on('connection', async (socket) => {
  console.log('A user connected');

  try {
    const messages = await ChatMessage.find({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).sort({ timestamp: 'asc' });

    socket.emit('chat history', messages);
  } catch (error) {
    console.error('Error retrieving messages:', error);
  }

  socket.on('chat message', async (messageData) => {
    const { user, message } = messageData;

    const newMessage = new ChatMessage({ user, message });
    await newMessage.save();

    io.emit('chat message', newMessage);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
