import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Cotton', 'Rayon', 'Chikankari'],
    required: [true, 'Category is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  originalPrice: {
    type: Number,
    default: null
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  sizes: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  }],
  badge: {
    type: String,
    enum: ['Bestseller', 'New', 'Limited', 'Sale', ''],
    default: ''
  },
  collection: {
    type: String,
    trim: true,
    default: ''
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: [true, 'Product image is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);
