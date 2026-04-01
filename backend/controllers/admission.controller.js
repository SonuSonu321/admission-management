const mongoose = require('mongoose');
const Applicant = require('../models/Applicant');
const Admission = require('../models/Admission');
const Counter = require('../models/Counter');
const Program = require('../models/Program');
const Quota = require('../models/Quota');

const generateAdmissionNumber = async (program, quota, session) => {
  // Format: INST/2026/UG/CSE/KCET/0001
  const year = new Date().getFullYear();
  const key = `${program.code}/${year}/${program.courseType}/${quota.quotaType}`;

  const counter = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { upsert: true, new: true, session }
  );

  const seq = String(counter.seq).padStart(4, '0');
  return `${key}/${seq}`;
};

exports.confirmAdmission = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { applicantId } = req.body;

    const applicant = await Applicant.findById(applicantId).session(session);
    if (!applicant) throw new Error('Applicant not found');
    if (applicant.admissionConfirmed) throw new Error('Admission already confirmed');
    if (!applicant.seatAllocated) throw new Error('Seat not yet allocated');
    if (applicant.documentStatus !== 'Verified') throw new Error('Documents not verified');
    if (applicant.feeStatus !== 'Paid') throw new Error('Fee not paid. Admission confirmation requires fee payment');

    const program = await Program.findById(applicant.programApplied).session(session);
    const quota = await Quota.findOne({
      program: applicant.programApplied,
      quotaType: applicant.quotaType,
    }).session(session);

    const admissionNumber = await generateAdmissionNumber(program, quota, session);

    const admission = await Admission.create(
      [
        {
          admissionNumber,
          applicant: applicant._id,
          program: program._id,
          quota: quota._id,
          academicYear: program.academicYear,
          confirmedBy: req.user._id,
        },
      ],
      { session }
    );

    applicant.admissionConfirmed = true;
    await applicant.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Admission confirmed', admissionNumber, admission: admission[0] });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
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
