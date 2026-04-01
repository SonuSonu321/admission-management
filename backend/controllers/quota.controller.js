const Quota = require('../models/Quota');
const Program = require('../models/Program');

exports.getQuotasByProgram = async (req, res) => {
  try {
    const quotas = await Quota.find({ program: req.params.programId });
    res.json(quotas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.saveQuotas = async (req, res) => {
  try {
    const { programId, quotas } = req.body; // quotas: [{quotaType, totalSeats}]
    const program = await Program.findById(programId);
    if (!program) return res.status(404).json({ message: 'Program not found' });

    const totalQuotaSeats = quotas.reduce((sum, q) => sum + q.totalSeats, 0);
    if (totalQuotaSeats > program.totalIntake) {
      return res.status(400).json({
        message: `Total quota seats (${totalQuotaSeats}) cannot exceed program intake (${program.totalIntake})`,
      });
    }

    // Upsert each quota
    const results = await Promise.all(
      quotas.map((q) =>
        Quota.findOneAndUpdate(
          { program: programId, quotaType: q.quotaType },
          { totalSeats: q.totalSeats, $setOnInsert: { allocatedSeats: 0 } },
          { upsert: true, new: true, runValidators: true }
        )
      )
    );

    // Recompute remainingSeats
    await Promise.all(results.map((q) => { q.remainingSeats = q.totalSeats - q.allocatedSeats; return q.save(); }));

    res.json(results);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
