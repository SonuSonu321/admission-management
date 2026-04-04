const Applicant = require('../models/Applicant');
const Admission = require('../models/Admission');
const Counter = require('../models/Counter');
const Program = require('../models/Program');
const Quota = require('../models/Quota');

const generateAdmissionNumber = async (program, quota) => {
  const year = new Date().getFullYear();
  const key = `${program.code}/${year}/${program.courseType}/${quota.quotaType}`;

  const counter = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  const seq = String(counter.seq).padStart(4, '0');
  return `${key}/${seq}`;
};

exports.confirmAdmission = async (req, res) => {
  try {
    const { applicantId } = req.body;

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });
    if (applicant.admissionConfirmed) return res.status(400).json({ message: 'Admission already confirmed' });
    if (!applicant.seatAllocated) return res.status(400).json({ message: 'Seat not yet allocated' });
    if (applicant.documentStatus !== 'Verified') return res.status(400).json({ message: 'Documents not verified' });
    if (applicant.feeStatus !== 'Paid') return res.status(400).json({ message: 'Fee not paid. Admission confirmation requires fee payment' });

    const program = await Program.findById(applicant.programApplied);
    const quota = await Quota.findOne({
      program: applicant.programApplied,
      quotaType: applicant.quotaType,
    });

    const admissionNumber = await generateAdmissionNumber(program, quota);

    const admission = await Admission.create({
      admissionNumber,
      applicant: applicant._id,
      program: program._id,
      quota: quota._id,
      academicYear: program.academicYear,
      confirmedBy: req.user._id,
    });

    applicant.admissionConfirmed = true;
    await applicant.save();

    res.status(201).json({ message: 'Admission confirmed', admissionNumber, admission });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find()
      .populate('applicant', 'fullName email mobile quotaType feeStatus documentStatus')
      .populate('program', 'name code courseType')
      .populate('quota', 'quotaType')
      .sort('-createdAt');
    res.json(admissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
