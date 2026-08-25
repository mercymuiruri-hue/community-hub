const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express(); // 1. Define app right away

const authRoutes = require('./routes/auth');

// 2. Use middleware and routes after app is defined
app.use(cors());
app.use(express.json());

// Mount auth routes
app.use('/api/auth', authRoutes);

// 3. Connect to MongoDB Atlas Cloud
const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(() => console.log(' Connected to MongoDB Atlas Cloud Successfully!'))
  .catch(err => console.error(' MongoDB Connection Error:', err));

// 2. Define Schema & Model
const postSchema = new mongoose.Schema({
  author: {
    name: String,
    handle: String,
    avatar: String
  },
  title: String,
  category: String,
  location: String,
  date: String,
  image: String,
  description: String,
  reactions: {
    type: Map,
    of: Number,
    default: { '🔥': 0, '❤️': 0, '🙌': 0 }
  },
  joinedCount: { type: Number, default: 1 },
  isJoined: { type: Boolean, default: false },
  comments: [{
    id: Number,
    user: String,
    text: String
  }]
});

const Post = mongoose.model('Post', postSchema);

// 3. Initial Seed Data
const seedData = [
  {
    author: { name: 'Nahashon', handle: '@nahashon_tech', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
    title: 'Need 2 devs for the 48-Hour Hackathon sprint!',
    category: 'Hackathons',
    location: 'CS Lab 3',
    date: 'This Friday • 6 PM',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    description: 'Building a local network dashboard & AI utility tool. Pizza and energy drinks sorted!',
    reactions: { '🔥': 15, '🙌': 8, '❤️': 12 },
    joinedCount: 5,
    isJoined: true,
    comments: [
      { id: 101, user: 'Drex', text: 'I am down for the backend API logic! 🔥' },
      { id: 102, user: 'Hoods', text: 'Count me in for network routing setup.' }
    ]
  },
  {
    author: { name: 'Mercy', handle: '@mercy_arts', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80' },
    title: 'Acoustic Sunset Jam & Art Exhibition 🎨',
    category: 'Art & Craft',
    location: 'South Lawn Pavilion',
    date: 'Tomorrow • 5:30 PM',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    description: 'Bringing sketchbooks and acoustic guitars. Yvonne and I will be setting up live portrait displays!',
    reactions: { '🔥': 22, '❤️': 31, '🎯': 7 },
    joinedCount: 14,
    isJoined: false,
    comments: [
      { id: 201, user: 'Yvonne', text: 'Can wait! Bringing all my acrylic paints 🎨' }
    ]
  }
];

const seedDB = async () => {
  try {
    const count = await Post.countDocuments();
    if (count === 0) {
      await Post.insertMany(seedData);
      console.log(' Seed mock data inserted into Cloud DB!');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

// 4. API Routes
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ _id: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

mongoose.connection.once('open', () => {
  seedDB();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
