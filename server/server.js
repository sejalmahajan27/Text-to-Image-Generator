import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './config/mongodb.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';

const PORT = process.env.PORT || 4000;
const app = express();

// Middleware to parse JSON
app.use(express.json());

// ✅ CORS setup to allow frontend hosted on Render
app.use(cors({
  origin: 'https://text-to-image-generator-1-ulqy.onrender.com',
  credentials: true,
}));

// ✅ Connect to MongoDB
await connectDB();

// ✅ Routes
app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);

// ✅ Test route
app.get('/', (req, res) => res.send("API Working"));

// ✅ Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
