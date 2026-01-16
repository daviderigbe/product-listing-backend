import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './app';
import { MONGODB_URI, PORT } from './config';

const port = PORT || 4000;

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

