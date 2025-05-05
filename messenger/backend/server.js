const express = require('express');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const chatbotRoute = require('./routes/chatbotRoute');
dotenv.config({ path: 'backend/config/config.env' });
const app = express();

// Allowed Origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:8000",
  "http://localhost:5000",
  "http://127.0.0.1:8000"
];

// --- Middlewares ---
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// --- Session & Passport Config ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

// --- Static Files ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/image', express.static(path.join(__dirname, '../frontend/public/image')));

// --- API Routes ---
const databaseConnect = require('./config/database');
const authRouter = require('./routes/authRoute');
const messengerRoute = require('./routes/messengerRoute');
const groupRoute = require('./routes/groupRoute');

app.use('/api/messenger', authRouter);
app.use('/api/messenger', messengerRoute);
app.use('/api/messenger', groupRoute);
app.use('/api/messenger', chatbotRoute);

app.get('/', (req, res) => {
  res.send('This is from backend Server');
});

// --- Create HTTP server and attach Socket.IO ---
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// --- Load Socket.IO logic ---
require('C:/Users/KIIT0001/Desktop/Chat Application Excise File - Copy/messenger/socket/socket')(io);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
databaseConnect();
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
