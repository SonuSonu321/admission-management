const router = require('express').Router();
const crudFactory = require('../controllers/masterSetup.controller');
const Institution = require('../models/Institution');
const { protect, authorize } = require('../middleware/auth.middleware');

const ctrl = crudFactory(Institution);
router.use(protect);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', authorize('admin'), ctrl.create);
router.put('/:id', authorize('admin'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
