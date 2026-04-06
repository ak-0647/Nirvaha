import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// GET /api/products - Public: Fetch all active products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ message: 'Failed to fetch products.' });
  }
});

// GET /api/products/:id - Public: Fetch single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product.' });
  }
});

export default router;
