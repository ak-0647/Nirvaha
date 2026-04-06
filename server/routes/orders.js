import express from 'express';
import multer from 'multer';
import Order from '../models/Order.js';
import BespokeOrder from '../models/CustomOrder.js';
import User from '../models/User.js';
import Media from '../models/Media.js';
import pkg from 'jsonwebtoken';
import { sendOrderPlacedEmailToAdmin, sendCustomOrderReceivedEmail } from '../utils/email.js';
const { verify } = pkg;

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to authenticate
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id || decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// GET /api/orders - Get orders for the logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Fetch Orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// POST /api/orders - Create a new order + send admin email notification
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, total, paymentMethod } = req.body;
    
    // Generate Order ID
    const orderId = `NRV-${Math.floor(10000 + Math.random() * 90000)}`;
    
    const newOrder = new Order({
      user: req.userId,
      orderId,
      items,
      total,
      status: 'Processing',
      statusColor: 'var(--gold)',
      paymentMethod: paymentMethod || 'card'
    });
    
    await newOrder.save();

    // Fetch user details for the admin email
    const user = await User.findById(req.userId).select('firstName lastName email');

    // Send email notification to admin
    if (user) {
      try {
        await sendOrderPlacedEmailToAdmin(
          { orderId, items, total },
          { firstName: user.firstName, lastName: user.lastName, email: user.email }
        );
      } catch (emailErr) {
        console.error('Failed to send admin order notification:', emailErr.message);
      }
    }

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Create Order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Get User's Custom Orders
router.get('/custom/me', authenticate, async (req, res) => {
  try {
    const orders = await BespokeOrder.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate('referenceImageId');
    res.json(orders);
  } catch (error) {
    console.error('Fetch custom orders error | userId:', req.userId, '| error:', error);
    res.status(500).json({ message: 'Server error fetching custom orders', details: error.message });
  }
});

// Create Custom Order with Image Upload
router.post('/custom', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { requirements, priceRange, paymentMethod } = req.body;
    
    if (!requirements || !priceRange) {
      return res.status(400).json({ message: 'Requirements and price range are required' });
    }

    let imageId = null;

    // Handle reference image upload
    if (req.file) {
      try {
        const newMedia = new Media({
          name: req.file.originalname,
          contentType: req.file.mimetype,
          data: req.file.buffer,
          size: req.file.size
        });
        await newMedia.save();
        imageId = newMedia._id;
      } catch (uploadErr) {
        console.error('Bespoke image upload failed:', uploadErr);
        // We continue even if image fails, or you can return error
      }
    }

    // Generate Custom Order ID
    const bespokeId = `CRV-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Create the order using the model
    const customOrder = new BespokeOrder({
      user: req.userId,
      bespokeId,
      requirements,
      priceRange,
      referenceImageId: imageId,
      status: 'Pending Assessment',
      paymentMethod: paymentMethod || 'card'
    });
    
    // Attempt save
    await customOrder.save();

    // Fetch user for email context
    const user = await User.findById(req.userId).select('firstName lastName email');
    
    // Notify admin
    if (user) {
      const imageUrl = imageId ? `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/media/image/${imageId}` : null;
      try {
          await sendCustomOrderReceivedEmail(
            'nirvahawaves@gmail.com', 
            { firstName: user.firstName, lastName: user.lastName, email: user.email },
            { requirements, priceRange },
            imageUrl,
            bespokeId
          );
      } catch (e) {
          console.error('Failed to send admin custom order email:', e.message);
      }
    }

    res.status(201).json({ 
      success: true,
      message: 'Custom order submitted successfully', 
      order: customOrder 
    });

  } catch (error) {
    console.error('INTERNAL_BESPOKE_API_ERROR:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit custom order', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
