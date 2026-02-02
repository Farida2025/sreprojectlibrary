const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/analytics.controller');

router.get('/top-books', auth, requireRole('admin'), ctrl.topBooks);
router.get('/top-authors', auth, requireRole('admin'), ctrl.topAuthors);
router.get('/top-categories', auth, requireRole('admin'), ctrl.topCategories);

module.exports = router;
