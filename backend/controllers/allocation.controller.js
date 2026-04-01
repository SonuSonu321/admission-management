const mongoose = require('mongoose');
const Applicant = require('../models/Applicant');
const Quota = require('../models/Quota');

exports.allocateSeat = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { applicantId, quotaId, allotmentNumber } = req.body;

    const applicant = await Applicant.findById(applicantId).session(session);
    if (!applicant) throw new Error('Applicant not found');
    if (applicant.seatAllocated) throw new Error('Seat already allocated for this applicant');

    const quota = await Quota.findById(quotaId).session(session);
    if (!quota) throw new Error('Quota not found');

    // Real-time seat availability check
    if (quota.remainingSeats <= 0) {
      throw new Error('Seat not available for selected quota');
    }

    // Lock seat atomically
    quota.allocatedSeats += 1;
    quota.remainingSeats = quota.totalSeats - quota.allocatedSeats;
    await quota.save({ session });

    applicant.seatAllocated = true;
    if (allotmentNumber) applicant.allotmentNumber = allotmentNumber;
    await applicant.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Seat allocated successfully', quota, applicant });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};
