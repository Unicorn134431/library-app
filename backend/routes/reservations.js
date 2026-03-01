const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, reservationController.reserve);
router.post('/:id/return', authMiddleware, reservationController.returnBook);
router.get('/user/my', authMiddleware, reservationController.getMyReservations);

module.exports = router;