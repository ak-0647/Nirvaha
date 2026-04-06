import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import BespokeOrder from '../models/CustomOrder.js';
import Media from '../models/Media.js';
import multer from 'multer';
import pkg from 'jsonwebtoken';
import { sendOrderUpdateEmailToUser, sendCustomOrderStatusEmail } from '../utils/email.js';
const { verify } = pkg;

const router = express.Router();

// ═══ Multer (Memory Storage for Image Upload) ═══
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp|gif)$/)) {
      return cb(new Error('Please upload an image file (jpg, jpeg, png, webp, gif)'));
    }
    cb(undefined, true);
  }
});

// Middleware: Authenticate Admin
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const decoded = verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id || decoded.userId);
    if (!user || user.email !== 'nirvahawaves@gmail.com') {
      return res.status(403).json({ message: 'Access denied: Admin privileges required.' });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired administrative token' });
  }
};

// Apply admin authentication to all routes below
router.use(authenticateAdmin);

// ════════════════════════════════════════════
// STATS
// ════════════════════════════════════════════

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments({ isActive: true });
    
    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      siteHealth: 'Optimal'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
});

// ════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password -otp').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return res.status(404).json({ message: 'User not found.' });
    
    // Prevent admin from deleting themselves
    if (userToDelete.email === 'nirvahawaves@gmail.com') {
      return res.status(403).json({ message: 'Cannot delete the admin account.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user.' });
  }
});

// ════════════════════════════════════════════
// ORDERS
// ════════════════════════════════════════════

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
});

// PUT /api/admin/orders/:id - Update order status (triggers email to user)
router.put('/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Accepted', 'Processing', 'In Transit', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    // Map status to color
    const statusColorMap = {
      'Accepted': '#8eb69b',
      'Processing': 'var(--gold)',
      'In Transit': '#60a5fa',
      'Delivered': '#4ecb8d',
      'Cancelled': '#e74c5a'
    };

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, statusColor: statusColorMap[status] },
      { new: true }
    ).populate('user', 'firstName lastName email');

    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Send email notification to user about status update
    if (order.user?.email) {
      try {
        await sendOrderUpdateEmailToUser(
          order.user.email,
          order.user.firstName,
          order.orderId,
          status
        );
      } catch (emailErr) {
        console.error('Failed to send order update email:', emailErr.message);
      }
    }

    res.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Failed to update order.' });
  }
});

// ════════════════════════════════════════════
// PRODUCTS (Collection Management)
// ════════════════════════════════════════════

// GET /api/admin/products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching products.' });
  }
});

// POST /api/admin/products - Create product with image upload
router.post('/products', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required.' });
    }

    const { name, category, price, originalPrice, description, sizes, badge, collection, rating } = req.body;

    // Save image to Media collection
    const media = new Media({
      name: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype,
      size: req.file.size
    });
    await media.save();

    // Create product linking to the media
    const product = new Product({
      name,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      description: description || '',
      sizes: sizes ? JSON.parse(sizes) : ['S', 'M', 'L'],
      badge: badge || '',
      collection: collection || '',
      rating: rating ? Number(rating) : 4.5,
      imageId: media._id
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully!',
      product,
      imageUrl: `/api/media/image/${media._id}`
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: error.message || 'Failed to create product.' });
  }
});

// PUT /api/admin/products/:id - Update product (optionally replace image)
router.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const { name, category, price, originalPrice, description, sizes, badge, collection, rating, isActive } = req.body;

    // If new image is uploaded, replace the old one
    if (req.file) {
      // Delete old media
      if (product.imageId) {
        await Media.findByIdAndDelete(product.imageId);
      }
      // Save new media
      const media = new Media({
        name: req.file.originalname,
        data: req.file.buffer,
        contentType: req.file.mimetype,
        size: req.file.size
      });
      await media.save();
      product.imageId = media._id;
    }

    // Update fields
    if (name) product.name = name;
    if (category) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (originalPrice !== undefined) product.originalPrice = originalPrice ? Number(originalPrice) : null;
    if (description !== undefined) product.description = description;
    if (sizes) product.sizes = JSON.parse(sizes);
    if (badge !== undefined) product.badge = badge;
    if (collection !== undefined) product.collection = collection;
    if (rating !== undefined) product.rating = Number(rating);
    if (isActive !== undefined) product.isActive = isActive === 'true' || isActive === true;

    await product.save();

    res.json({
      message: 'Product updated successfully!',
      product,
      imageUrl: `/api/media/image/${product.imageId}`
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: error.message || 'Failed to update product.' });
  }
});

// DELETE /api/admin/products/:id - Delete product and its image
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    // Delete linked media image
    if (product.imageId) {
      await Media.findByIdAndDelete(product.imageId);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product.' });
  }
});

// GET /api/admin/custom-orders - Fetch all custom requests
router.get('/custom-orders', async (req, res) => {
  try {
    const orders = await BespokeOrder.find()
      .populate('user', 'firstName lastName email phone')
      .populate('referenceImageId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch custom orders.' });
  }
});

// PUT /api/admin/custom-orders/:id/status - Update custom order status & notes
router.put('/custom-orders/:id/status', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    // Validate status
    const validStatuses = ['Pending Assessment', 'Accepted', 'Rejected', 'In Production', 'Shipped', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const order = await BespokeOrder.findById(req.params.id).populate('user', 'firstName lastName email');
    if (!order) return res.status(404).json({ message: 'Custom order not found.' });

    const statusChanged = order.status !== status;
    order.status = status;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;

    await order.save();

    // Send email to user if status changed
    if (statusChanged && order.user?.email) {
      try {
        await sendCustomOrderStatusEmail(order.user.email, order.user.firstName, status, order.adminNotes, order.orderId);
      } catch (err) {
        console.error('Failed to notify user about custom order update:', err);
      }
    }

    res.json({ message: 'Custom order updated successfully.', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update custom order.' });
  }
});

export default router;
