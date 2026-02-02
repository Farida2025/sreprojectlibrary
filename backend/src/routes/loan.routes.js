const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/loan.controller');

router.post('/borrow', auth, ctrl.borrow);
router.post('/return', auth, ctrl.returnBook);
router.get('/my', auth, ctrl.myLoans);
router.get('/', auth, requireRole('admin'), ctrl.getAll);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);

module.exports = router;
