const router = require('express').Router();
const ctrl = require('../controllers/animeController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', ctrl.getAnimeSeries);
router.get('/:id', ctrl.getAnime);
router.post('/', auth, requireRole('admin', 'moderator'), ctrl.createAnime);
router.put('/:id', auth, requireRole('admin', 'moderator'), ctrl.updateAnime);
router.delete('/:id', auth, requireRole('admin'), ctrl.deleteAnime);

module.exports = router;
