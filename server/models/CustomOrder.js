import mongoose from 'mongoose';

const customOrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bespokeId: {
    type: String
  },
  requirements: {
    type: String,
    required: true
  },
  priceRange: {
    type: String,
    required: true
  },
  referenceImageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: false
  },
  status: {
    type: String,
    enum: ['Pending Assessment', 'Accepted', 'Rejected', 'In Production', 'Shipped', 'Completed', 'Cancelled'],
    default: 'Pending Assessment'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'cod'],
    default: 'card'
  }
}, { timestamps: true });

export default mongoose.models.BespokeOrder || mongoose.model('BespokeOrder', customOrderSchema);
