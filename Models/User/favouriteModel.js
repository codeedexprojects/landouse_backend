const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
}, { timestamps: true });

favouriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true }); // Prevent duplicate favourites

module.exports = mongoose.model('Favourite', favouriteSchema);
