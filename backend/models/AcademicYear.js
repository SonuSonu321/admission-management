const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema(
  {
    year: { type: String, required: true, unique: true }, // e.g. "2025-26"
    startDate: { type: Date },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AcademicYear', academicYearSchema);
