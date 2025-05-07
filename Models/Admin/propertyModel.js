const mongoose = require('mongoose');

const PrivateNoteSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  title: { type: String, required: true }
});

const PropertySchema = new mongoose.Schema({
  property_type: { type: String, required: true },
  property_price: { type: Number, required: true },
  area: { type: Number, required: true },
  whats_nearby: { type: String },
  buildIn: { type: String },
  cent: { type: String },
  maxrooms: { type: Number },
  beds: { type: Number },
  baths: { type: Number },
  description: { type: String },
  address: { type: String, required: true },
  zipcode: { type: String },
  locationmark: { type: String }, 
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  photos: [{ type: String }], 
  soldOut: { type: Boolean, default: false },
  private_note: PrivateNoteSchema,
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'created_by_model' 
  },
  created_by_model: {
    type: String,
    // required: true,
    enum: ['Admin', 'Vendor'] 
  },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', PropertySchema);
