const mongoose = require('mongoose');

// Used for auto-incrementing admission numbers per program+quota+year
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "INST/2026/UG/CSE/KCET"
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model('Counter', counterSchema);
