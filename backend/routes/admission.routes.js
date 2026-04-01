const router = require('express').Router();
const { confirmAdmission, getAdmissions } = require('../controllers/admission.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getAdmissions);
router.post('/', authorize('admin', 'admission_officer'), confirmAdmission);

module.exports = router;
