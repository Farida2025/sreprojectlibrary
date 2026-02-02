const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/book.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', auth, requireRole('admin'), ctrl.create);
router.put('/:id', auth, requireRole('admin'), ctrl.update);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);
router.post('/:id/tags', auth, requireRole('admin'), ctrl.addTag);
router.delete('/:id/tags', auth, requireRole('admin'), ctrl.removeTag);

module.exports = router;
