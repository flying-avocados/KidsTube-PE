const express = require('express');
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

const authRoutes = require('./routes/auth');
const subProfilesRoutes = require('./routes/subprofiles');
const videosRoutes = require('./routes/videos');

app.use('/api/auth', authRoutes);
app.use('/api/subprofiles', subProfilesRoutes);
app.use('/api/videos', videosRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 