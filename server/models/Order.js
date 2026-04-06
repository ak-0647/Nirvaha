import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  items: [{
    name: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: String, required: true }, // Format: '₹18,999'
    image: { type: String, required: true }
  }],
  total: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Accepted', 'Processing', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  statusColor: {
    type: String,
    default: 'var(--gold)'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'cod'],
    default: 'card'
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
