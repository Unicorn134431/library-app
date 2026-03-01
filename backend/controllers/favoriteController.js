const pool = require('../config/database');

exports.addFavorite = async (req, res) => {
  try {
    const { book_id } = req.body;
    const user_id = req.user.id;

    const conn = await pool.getConnection();

    try {
      await conn.query(
        'INSERT INTO favorites (user_id, book_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE added_at = NOW()',
        [user_id, book_id]
      );

      return res.status(201).json({ message: 'Добавлено в избранное' });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка' });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const book_id = req.params.book_id;
    const user_id = req.user.id;

    const conn = await pool.getConnection();

    try {
      await conn.query(
        'DELETE FROM favorites WHERE user_id = ? AND book_id = ?',
        [user_id, book_id]
      );

      return res.json({ message: 'Удалено из избранного' });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка' });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user_id = req.user.id;
    const conn = await pool.getConnection();

    try {
      const [favorites] = await conn.query(`
        SELECT 
          b.*,
          COUNT(DISTINCT br.id) as total_ratings,
          ROUND(AVG(br.rating), 2) as average_rating
        FROM favorites f
        JOIN books b ON f.book_id = b.id
        LEFT JOIN book_ratings br ON b.id = br.book_id
        WHERE f.user_id = ?
        GROUP BY b.id
      `, [user_id]);

      return res.json(favorites);
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка' });
  }
};

exports.checkFavorite = async (req, res) => {
  try {
    const book_id = req.params.book_id;
    const user_id = req.user.id;

    const conn = await pool.getConnection();

    try {
      const [result] = await conn.query(
        'SELECT id FROM favorites WHERE user_id = ? AND book_id = ?',
        [user_id, book_id]
      );

      return res.json({ is_favorite: result.length > 0 });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка' });
  }
};