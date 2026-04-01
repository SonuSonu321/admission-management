const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    fatherName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    mobile: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    address: { type: String, required: true },
    category: { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS'], required: true },
    entryType: { type: String, enum: ['Regular', 'Lateral'], required: true },
    quotaType: { type: String, enum: ['KCET', 'COMEDK', 'Management', 'Supernumerary'], required: true },
    marks: { type: Number },
    qualifyingExam: { type: String },
    programApplied: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
    allotmentNumber: { type: String }, // for government flow
    documentStatus: { type: String, enum: ['Pending', 'Submitted', 'Verified'], default: 'Pending' },
    feeStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    seatAllocated: { type: Boolean, default: false },
    admissionConfirmed: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Applicant', applicantSchema);
