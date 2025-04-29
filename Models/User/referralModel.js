const mongoose = require('mongoose');

const referralShareSchema = new mongoose.Schema({
  sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referralCode: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  sharedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReferralShare', referralShareSchema);
