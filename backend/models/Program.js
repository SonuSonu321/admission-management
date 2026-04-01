const mongoose = require('mongoose');

const programSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    courseType: { type: String, enum: ['UG', 'PG'], required: true },
    entryType: { type: String, enum: ['Regular', 'Lateral'], required: true },
    admissionMode: { type: String, enum: ['Government', 'Management'], required: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    totalIntake: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Program', programSchema);
