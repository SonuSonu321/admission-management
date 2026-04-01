// Generic CRUD factory for master setup modules
const crudFactory = (Model, populateFields = '') => ({
  getAll: async (req, res) => {
    try {
      const search = req.query.search
        ? { name: { $regex: req.query.search, $options: 'i' } }
        : {};
      let query = Model.find({ ...search, isActive: true });
      if (populateFields) query = query.populate(populateFields);
      const docs = await query;
      res.json(docs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getOne: async (req, res) => {
    try {
      let query = Model.findById(req.params.id);
      if (populateFields) query = query.populate(populateFields);
      const doc = await query;
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json(doc);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const doc = await Model.create(req.body);
      res.status(201).json(doc);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json(doc);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  remove: async (req, res) => {
    try {
      await Model.findByIdAndUpdate(req.params.id, { isActive: false });
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
});

module.exports = crudFactory;
