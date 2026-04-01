const Applicant = require('../models/Applicant');

exports.getApplicants = async (req, res) => {
  try {
    const filter = { };
    if (req.query.quotaType) filter.quotaType = req.query.quotaType;
    if (req.query.programApplied) filter.programApplied = req.query.programApplied;
    if (req.query.search) {
      filter.$or = [
        { fullName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { mobile: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const applicants = await Applicant.find(filter)
      .populate('programApplied', 'name code courseType')
      .sort('-createdAt');
    res.json(applicants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id).populate('programApplied');
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });
    res.json(applicant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(applicant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });
    if (applicant.admissionConfirmed)
      return res.status(400).json({ message: 'Cannot edit a confirmed admission' });

    const updated = await Applicant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });
    if (applicant.admissionConfirmed)
      return res.status(400).json({ message: 'Cannot delete a confirmed admission' });
    await applicant.deleteOne();
    res.json({ message: 'Applicant deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
