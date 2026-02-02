const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/user.controller');

router.get('/me', auth, ctrl.me);
router.get('/', auth, requireRole('admin'), ctrl.getAll);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);

module.exports = router;
