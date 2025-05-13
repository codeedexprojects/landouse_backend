const mongoose = require('mongoose');

const subPlaceSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, 
  subPlaces: [subPlaceSchema]
});

module.exports = mongoose.model('Place', placeSchema);
