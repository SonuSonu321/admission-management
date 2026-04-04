const Applicant = require('../models/Applicant');
const Quota = require('../models/Quota');

exports.allocateSeat = async (req, res) => {
  try {
    const { applicantId, quotaId, allotmentNumber } = req.body;

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });
    if (applicant.seatAllocated) return res.status(400).json({ message: 'Seat already allocated for this applicant' });

    const quota = await Quota.findById(quotaId);
    if (!quota) return res.status(404).json({ message: 'Quota not found' });

    // Real-time seat availability check
    if (quota.remainingSeats <= 0) {
      return res.status(400).json({ message: 'Seat not available for selected quota' });
    }

    // Update quota counters
    quota.allocatedSeats += 1;
    quota.remainingSeats = quota.totalSeats - quota.allocatedSeats;
    await quota.save();

    // Update applicant
    applicant.seatAllocated = true;
    if (allotmentNumber) applicant.allotmentNumber = allotmentNumber;
    await applicant.save();

    res.json({ message: 'Seat allocated successfully', quota, applicant });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
