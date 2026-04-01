const router = require('express').Router();
const { getQuotasByProgram, saveQuotas } = require('../controllers/quota.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/:programId', getQuotasByProgram);
router.post('/', authorize('admin'), saveQuotas);

module.exports = router;
