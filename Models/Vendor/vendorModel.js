const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String,  },
  role: { 
    type: String, 
    enum: ['Broker', 'Employee', 'Developer', 'Builder'], 
    required: true 
  },
  number: { type: String, required: true, unique: true },
  city: { type: String,  },
  state: { type: String },
  postCode: { type: String },
  email: { type: String },
  aboutVendor: { type: String },
  approvalStatus: { type: Boolean, default: false }, 
  profileImage: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vendor', vendorSchema);
