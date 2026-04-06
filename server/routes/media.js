import express from 'express';
import multer from 'multer';
import Media from '../models/Media.js';

const router = express.Router();

// ═══ Multer Configuration (Memory Storage) ═══
const storage = multer.memoryStorage();
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp|gif)$/)) {
      return cb(new Error('Please upload an image file (jpg, jpeg, png, webp, gif)'));
    }
    cb(undefined, true);
  }
});

// ════════════════════════════════════
// POST /api/media/upload
// Upload an image to MongoDB (Buffer)
// ════════════════════════════════════
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { originalname, buffer, mimetype, size } = req.file;

    const media = new Media({
      name: originalname,
      data: buffer,
      contentType: mimetype,
      size: size
    });

    await media.save();

    res.status(201).json({
      message: 'Image uploaded successfully!',
      imageId: media._id,
      url: `/api/media/image/${media._id}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Upload failed.' });
  }
});

// ════════════════════════════════════
// GET /api/media/image/:id
// Retrieve image from MongoDB and serve it
// ════════════════════════════════════
router.get('/image/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media || !media.data) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    res.set('Content-Type', media.contentType);
    res.send(media.data);

  } catch (error) {
    console.error('Fetch image error:', error);
    res.status(500).json({ message: 'Failed to fetch image.' });
  }
});

// ════════════════════════════════════
// DELETE /api/media/image/:id
// Delete image from MongoDB
// ════════════════════════════════════
router.delete('/image/:id', async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) return res.status(404).json({ message: 'Image not found.' });
    res.json({ message: 'Image deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed.' });
  }
});

export default router;
