const pool = require('../config/database');

exports.reserve = async (req, res) => {
  try {
    const { book_id } = req.body;
    const user_id = req.user.id;

    const conn = await pool.getConnection();

    try {
      const [books] = await conn.query(
        'SELECT id, available_copies FROM books WHERE id = ?',
        [book_id]
      );

      if (books.length === 0) {
        return res.status(404).json({ error: 'Книга не найдена' });
      }

      if (books[0].available_copies <= 0) {
        return res.status(400).json({ error: 'Нет доступных копий' });
      }

      const [activeRes] = await conn.query(
        'SELECT id FROM reservations WHERE user_id = ? AND book_id = ? AND status = "active"',
        [user_id, book_id]
      );

      if (activeRes.length > 0) {
        return res.status(400).json({ error: 'Вы уже забронировали эту книгу' });
      }

      await conn.beginTransaction();

      await conn.query(
        'UPDATE books SET available_copies = available_copies - 1 WHERE id = ?',
        [book_id]
      );

      const due_date = new Date();
      due_date.setDate(due_date.getDate() + 14);

      const [result] = await conn.query(
        'INSERT INTO reservations (user_id, book_id, status, due_date) VALUES (?, ?, "active", ?)',
        [user_id, book_id, due_date]
      );

      await conn.commit();

      return res.status(201).json({
        message: 'Книга забронирована',
        reservation_id: result.insertId
      });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при бронировании' });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const reservation_id = req.params.id;
    const user_id = req.user.id;

    const conn = await pool.getConnection();

    try {
      const [reservations] = await conn.query(
        'SELECT book_id FROM reservations WHERE id = ? AND user_id = ?',
        [reservation_id, user_id]
      );

      if (reservations.length === 0) {
        return res.status(404).json({ error: 'Бронирование не найдено' });
      }

      const book_id = reservations[0].book_id;

      await conn.beginTransaction();

      await conn.query(
        'UPDATE reservations SET status = "returned", returned_at = NOW() WHERE id = ?',
        [reservation_id]
      );

      await conn.query(
        'UPDATE books SET available_copies = available_copies + 1 WHERE id = ?',
        [book_id]
      );

      await conn.commit();

      return res.json({ message: 'Книга возвращена' });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при возврате' });
  }
};

exports.getMyReservations = async (req, res) => {
  try {
    const user_id = req.user.id;
    const conn = await pool.getConnection();

    try {
      const [reservations] = await conn.query(`
        SELECT 
          r.id,
          r.book_id,
          b.title,
          b.image_url,
          b.author,
          r.reserved_at,
          r.due_date,
          r.status,
          DATEDIFF(r.due_date, CURDATE()) as days_left
        FROM reservations r
        JOIN books b ON r.book_id = b.id
        WHERE r.user_id = ? AND r.status IN ('active', 'overdue')
        ORDER BY r.due_date ASC
      `, [user_id]);

      return res.json(reservations);
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка' });
  }
};