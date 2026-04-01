const Applicant = require('../models/Applicant');
const Admission = require('../models/Admission');
const Quota = require('../models/Quota');
const Program = require('../models/Program');

exports.getDashboard = async (req, res) => {
  try {
    const [
      totalApplicants,
      totalAdmitted,
      pendingFees,
      pendingDocuments,
      quotas,
      programAdmissions,
    ] = await Promise.all([
      Applicant.countDocuments(),
      Applicant.countDocuments({ admissionConfirmed: true }),
      Applicant.countDocuments({ feeStatus: 'Pending', seatAllocated: true }),
      Applicant.countDocuments({ documentStatus: { $ne: 'Verified' }, seatAllocated: true }),
      Quota.find().populate('program', 'name code totalIntake'),
      Admission.aggregate([
        { $group: { _id: '$program', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'programs',
            localField: '_id',
            foreignField: '_id',
            as: 'program',
          },
        },
        { $unwind: '$program' },
        { $project: { programName: '$program.name', count: 1 } },
      ]),
    ]);

    const totalIntake = quotas.reduce((sum, q) => sum + q.totalSeats, 0);
    const totalAllocated = quotas.reduce((sum, q) => sum + q.allocatedSeats, 0);
    const totalRemaining = totalIntake - totalAllocated;

    const quotaStats = quotas.map((q) => ({
      quotaType: q.quotaType,
      program: q.program?.name,
      totalSeats: q.totalSeats,
      allocatedSeats: q.allocatedSeats,
      remainingSeats: q.remainingSeats,
      fillPercentage: q.totalSeats > 0 ? Math.round((q.allocatedSeats / q.totalSeats) * 100) : 0,
    }));

    res.json({
      totalApplicants,
      totalAdmitted,
      totalIntake,
      totalAllocated,
      totalRemaining,
      pendingFees,
      pendingDocuments,
      quotaStats,
      programAdmissions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
