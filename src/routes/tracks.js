const router = require('express').Router();
const ctrl = require('../controllers/trackController');
const { auth, requireRole, optionalAuth } = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');

router.get('/', ctrl.getTracks);
router.get('/stats', ctrl.getStats);
router.get('/:id', ctrl.getTrack);
router.get('/:id/download', optionalAuth, ctrl.downloadTrack);

router.post('/', auth, requireRole('admin', 'moderator'), uploadFields, ctrl.uploadTrack);
router.put('/:id', auth, requireRole('admin', 'moderator'), ctrl.updateTrack);
router.delete('/:id', auth, requireRole('admin'), ctrl.deleteTrack);

module.exports = router;
