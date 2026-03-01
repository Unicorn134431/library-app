const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const ratingController = require('../controllers/ratingController');
const favoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/auth');

// =====================
// Favorites routes
// =====================
router.post('/favorites/add', authMiddleware, favoriteController.addFavorite);
router.delete('/favorites/:book_id', authMiddleware, favoriteController.removeFavorite);
router.get('/favorites', authMiddleware, favoriteController.getFavorites);
router.get('/favorites/check/:book_id', authMiddleware, favoriteController.checkFavorite);

// =====================
// Ratings routes
// =====================
router.post('/:book_id/rating', authMiddleware, ratingController.rateBook);
router.get('/:book_id/rating', authMiddleware, ratingController.getUserRating);

// =====================
// Books routes
// =====================
router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBookById);

module.exports = router;