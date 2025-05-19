const mongoose = require('mongoose');

const affiliateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  otp: { type: String },
  isApproved: { type: Boolean, default: false },
  referralId: { type: String, unique: true },
   userAmounts: {
      type: Map,
      of: Number,
      default: {},
    },
  amount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Affiliate', affiliateSchema);
