const mongoose = require('mongoose');

const FizickiParametarSchema = new mongoose.Schema({
  tip: {
    type: String,
    required: false
  },
  naziv: {
    type: String,
    required: false
  },
});

module.exports = mongoose.model('FizickiParametar', FizickiParametarSchema);
