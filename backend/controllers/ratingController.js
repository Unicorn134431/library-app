const pool = require('../config/database');

exports.rateBook = async (req, res) => {
  try {
    const book_id = req.params.book_id;
    const user_id = req.user.id;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Рейтинг должен быть от 1 до 5' });
    }

    const conn = await pool.getConnection();

    try {
      const [existingRating] = await conn.query(
        'SELECT id FROM book_ratings WHERE book_id = ? AND user_id = ?',
        [book_id, user_id]
      );

      if (existingRating.length > 0) {
        await conn.query(
          'UPDATE book_ratings SET rating = ?, review = ?, updated_at = NOW() WHERE book_id = ? AND user_id = ?',
          [rating, review || null, book_id, user_id]
        );
      } else {
        await conn.query(
          'INSERT INTO book_ratings (book_id, user_id, rating, review) VALUES (?, ?, ?, ?)',
          [book_id, user_id, rating, review || null]
        );
      }

      return res.status(201).json({ message: 'Рейтинг сохранен' });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка' });
  }
};

exports.getUserRating = async (req, res) => {
  try {
    const book_id = req.params.book_id;
    const user_id = req.user.id;

    const conn = await pool.getConnection();

    try {
      const [userRating] = await conn.query(
        'SELECT rating, review FROM book_ratings WHERE book_id = ? AND user_id = ?',
        [book_id, user_id]
      );

      return res.json({
        has_rating: userRating.length > 0,
        rating: userRating.length > 0 ? userRating[0].rating : null
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка' });
  }
};