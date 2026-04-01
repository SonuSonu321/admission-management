const mongoose = require('mongoose');

const quotaSchema = new mongoose.Schema(
  {
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
    quotaType: { type: String, enum: ['KCET', 'COMEDK', 'Management', 'Supernumerary'], required: true },
    totalSeats: { type: Number, required: true, min: 0 },
    allocatedSeats: { type: Number, default: 0 },
    remainingSeats: { type: Number },
  },
  { timestamps: true }
);

// Auto-compute remainingSeats before save
quotaSchema.pre('save', function (next) {
  this.remainingSeats = this.totalSeats - this.allocatedSeats;
  next();
});

quotaSchema.index({ program: 1, quotaType: 1 }, { unique: true });

module.exports = mongoose.model('Quota', quotaSchema);
