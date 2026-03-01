const pool = require('../config/database');

exports.getBooks = async (req, res) => {
  try {
    const { category, search } = req.query;
    const conn = await pool.getConnection();

    try {
      let query = `
        SELECT 
          b.*,
          COUNT(DISTINCT br.id) as total_ratings,
          ROUND(AVG(br.rating), 2) as average_rating
        FROM books b
        LEFT JOIN book_ratings br ON b.id = br.book_id
        WHERE b.status = 'active'
      `;
      let params = [];

      if (category) {
        query += ' AND b.category = ?';
        params.push(category);
      }

      if (search) {
        query += ' AND (b.title LIKE ? OR b.author LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' GROUP BY b.id ORDER BY b.title';

      const [books] = await conn.query(query, params);
      return res.json(books);
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении книг' });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const conn = await pool.getConnection();

    try {
      const [books] = await conn.query(`
        SELECT 
          b.*,
          COUNT(DISTINCT br.id) as total_ratings,
          ROUND(AVG(br.rating), 2) as average_rating
        FROM books b
        LEFT JOIN book_ratings br ON b.id = br.book_id
        WHERE b.id = ? AND b.status = 'active'
        GROUP BY b.id
      `, [req.params.id]);

      if (books.length === 0) {
        return res.status(404).json({ error: 'Книга не найдена' });
      }

      return res.json(books[0]);
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка' });
  }
};