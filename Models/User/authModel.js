const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String },
  address: { type: String },
  invitationCode: { type: String },
  isActive: { type: Boolean, default: true },
  profileImage: { type: String },
  referralId: { type: String, unique: true }, 
  invitedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    referralCode: String,
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
