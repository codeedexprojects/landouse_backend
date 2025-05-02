const mongoose = require('mongoose');

const affiliateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  number: {
    type: String,
    required: true,
    trim: true
  },
  referralCode: {
    type: String,
    required: true,
    unique: true
  },
  affiliateAmount: {
    type: Number,
    default: 0  // default amount is 0 if admin doesn’t set it
  }
}, { timestamps: true });

module.exports = mongoose.model('Affiliate', affiliateSchema);
