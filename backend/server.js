const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files (uploaded images and videos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => {
  res.send('KidsTube-PE backend is running!');
});


// MongoDB connection (update URI as needed)
mongoose.connect('mongodb://localhost:27017/kidstube', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true,                               // allow cookies/authorization
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));


const authRoutes = require('./routes/auth');
const childrenRoutes = require('./routes/children');
const videosRoutes = require('./routes/videos');
const usersRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/subprofiles', childrenRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/users', usersRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 



/*const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Test route
app.get('/', (req, res) => {
  res.send('KidsTube-PE backend is running!');
});

// MongoDB connection (update URI as needed)
mongoose.connect('mongodb://localhost:27017/kidstube', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 


*/