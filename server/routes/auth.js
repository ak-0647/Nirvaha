import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateOTP, sendOTPEmail, sendWelcomeEmail, sendForgotPasswordEmail } from '../utils/email.js';

const router = express.Router();

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ════════════════════════════════════
// POST /api/auth/register
// Step 1: Register & send OTP
// ════════════════════════════════════
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, gender, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // If user exists but not verified, delete old record and re-register
    if (existingUser && !existingUser.isVerified) {
      await User.deleteOne({ email });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user (unverified)
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      gender,
      password,
      isVerified: false,
      otp: {
        code: otp,
        expiresAt: otpExpires
      }
    });

    // Send OTP email
    await sendOTPEmail(email, otp, firstName);
    console.log(`[DEBUG] Registration success for ${email}. OTP: ${otp}`);

    res.status(201).json({
      message: 'OTP sent to your email. Please verify to complete registration.',
      email: user.email
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// ════════════════════════════════════
// POST /api/auth/verify-otp
// Step 2: Verify OTP & activate account
// ════════════════════════════════════
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already verified. Please login.' });
    }

    // Check OTP
    if (!user.otp || user.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Check expiry
    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    // Verify user
    user.isVerified = true;
    user.otp = undefined; // clear OTP
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(email, user.firstName);
    } catch (emailErr) {
      console.log('Welcome email failed (non-critical):', emailErr.message);
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.json({
      message: 'Account verified successfully! Welcome to NIRVAHA 💙',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        role: user.role
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
});

// ════════════════════════════════════
// POST /api/auth/resend-otp
// Resend OTP for registration
// ════════════════════════════════════
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already verified. Please login.' });
    }

    // Generate new OTP
    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };
    await user.save();

    // Send OTP
    await sendOTPEmail(email, otp, user.firstName);

    res.json({ message: 'New OTP sent to your email.' });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP. Please try again.' });
  }
});

// ════════════════════════════════════
// POST /api/auth/forgot-password
// Step 1: Send OTP for password reset
// ════════════════════════════════════
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    // Generate and save OTP
    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };
    await user.save();

    // Send email
    await sendForgotPasswordEmail(email, otp, user.firstName);

    res.json({ message: 'OTP sent to your email for password reset.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// ════════════════════════════════════
// POST /api/auth/reset-password
// Step 2: Verify OTP and update password
// ════════════════════════════════════
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check OTP
    if (!user.otp || user.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid reset code. Please try again.' });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: 'Reset code expired. Please request a new one.' });
    }

    // Update password
    user.password = newPassword;
    user.otp = undefined; // Clear OTP
    await user.save();

    res.json({ message: 'Password updated successfully! Please login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password. Please try again.' });
  }
});

// ════════════════════════════════════
// PUT /api/auth/profile
// Update user details (Protected)
// ════════════════════════════════════
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { firstName, lastName, phone, gender } = req.body;

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;

    await user.save();

    res.json({
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile. Please try again.' });
  }
});

// ════════════════════════════════════
// POST /api/auth/login
// Login with email & password
// ════════════════════════════════════
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first.', needsVerification: true, email: user.email });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// ════════════════════════════════════
// GET /api/auth/me
// Get current user (protected)
// ════════════════════════════════════
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -otp');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

export default router;
