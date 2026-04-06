import express from 'express';
import Newsletter from '../models/Newsletter.js';

const router = express.Router();

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) return res.status(400).json({ message: 'This email is already subscribed!' });

    const newSub = new Newsletter({ email });
    await newSub.save();

    res.status(201).json({ message: 'Successfully subscribed! ✨' });
  } catch (error) {
    console.error('Newsletter error:', error);
    res.status(500).json({ message: 'Failed to subscribe. Please try again later.' });
  }
});

export default router;
