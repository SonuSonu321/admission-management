const router = require('express').Router();
const { allocateSeat } = require('../controllers/allocation.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/', protect, authorize('admin', 'admission_officer'), allocateSeat);

module.exports = router;
