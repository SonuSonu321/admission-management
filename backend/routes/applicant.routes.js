const router = require('express').Router();
const {
  getApplicants,
  getApplicant,
  createApplicant,
  updateApplicant,
  deleteApplicant,
} = require('../controllers/applicant.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getApplicants);
router.get('/:id', getApplicant);
router.post('/', authorize('admin', 'admission_officer'), createApplicant);
router.put('/:id', authorize('admin', 'admission_officer'), updateApplicant);
router.delete('/:id', authorize('admin', 'admission_officer'), deleteApplicant);

module.exports = router;
