const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema(
  {
    admissionNumber: { type: String, required: true, unique: true, immutable: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant', required: true, unique: true },
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
    quota: { type: mongoose.Schema.Types.ObjectId, ref: 'Quota', required: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    confirmedAt: { type: Date, default: Date.now },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Prevent updates to confirmed admission records
admissionSchema.pre('findOneAndUpdate', function () {
  throw new Error('Admission records are immutable once confirmed.');
});

module.exports = mongoose.model('Admission', admissionSchema);
