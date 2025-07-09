const mongoose = require('mongoose');

const PropertySellSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['Apartment', 'Villa', 'House', 'Plot/Land', 'Commercial', 'Office', 'Other'],
  },
  location: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
  status: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PropertySell', PropertySellSchema);
