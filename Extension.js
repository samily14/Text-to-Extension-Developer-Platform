const express = require('express');
const router = express.Router();
const {
  getExtensions,
  getExtension,
  createExtension,
  updateExtension,
  deleteExtension,
  downloadExtension,
  getStats
} = require('../controllers/extensionController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/stats', getStats);
router.route('/').get(getExtensions).post(createExtension);
router.route('/:id').get(getExtension).put(updateExtension).delete(deleteExtension);
router.get('/:id/download', downloadExtension);

module.exports = router;
