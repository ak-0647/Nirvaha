import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import mediaRoutes from './routes/media.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import productRoutes from './routes/products.js';
import newsletterRoutes from './routes/newsletter.js';

dotenv.config();

const app = express();

// ═══ Middleware ═══
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ═══ Routes ═══
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ═══ MongoDB Connection ═══
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
    console.log(`📦 Database: ${mongoose.connection.db.databaseName}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    if (error.message.includes('IP Whitelist')) {
      console.log('\n💡 Please check your MongoDB Atlas IP Whitelist (Network Access).\n');
    }
    process.exit(1); // Exit if DB connection fails
  }
};

// ═══ Start Server ═══
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 NIRVAHA Server running on http://localhost:${PORT}`);
    console.log(`📧 SMTP: ${process.env.SMTP_EMAIL}`);
    console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}\n`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Please stop the process using it or choose another port.`);
      process.exit(1);
    }
  });
};

startServer();
