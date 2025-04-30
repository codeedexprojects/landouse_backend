const mongoose = require('mongoose');

const compareSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  properties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Compare', compareSchema);
