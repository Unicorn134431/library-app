const pool = require('../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    const conn = await pool.getConnection();

    try {
      const [stats] = await conn.query(`
        SELECT 
          (SELECT COUNT(*) FROM books) as total_books,
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM reservations WHERE status = 'active') as active_reservations,
          (SELECT COUNT(*) FROM reservations WHERE status = 'overdue') as overdue_reservations
      `);

      return res.json(stats[0]);
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const conn = await pool.getConnection();

    try {
      const [users] = await conn.query(
        'SELECT id, login, email, full_name, role, created_at FROM users'
      );

      for (let user of users) {
        const [reservations] = await conn.query(
          'SELECT COUNT(*) as count FROM reservations WHERE user_id = ? AND status = "active"',
          [user.id]
        );
        user.active_reservations = reservations[0].count;
      }

      return res.json(users);
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка' });
  }
};

exports.getReservations = async (req, res) => {
  try {
    const conn = await pool.getConnection();

    try {
      const [reservations] = await conn.query(`
        SELECT 
          r.id,
          r.user_id,
          u.login,
          r.book_id,
          b.title,
          r.reserved_at,
          r.due_date,
          r.status,
          DATEDIFF(r.due_date, CURDATE()) as days_left
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        JOIN books b ON r.book_id = b.id
        ORDER BY r.due_date ASC
      `);

      return res.json(reservations);
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка' });
  }
};

exports.updateReservationStatus = async (req, res) => {
  try {
    const reservation_id = req.params.id;
    const { status } = req.body;

    const conn = await pool.getConnection();

    try {
      const [reservations] = await conn.query(
        'SELECT book_id FROM reservations WHERE id = ?',
        [reservation_id]
      );

      if (reservations.length === 0) {
        return res.status(404).json({ error: 'Не найдено' });
      }

      const book_id = reservations[0].book_id;

      await conn.beginTransaction();

      if (status === 'returned') {
        await conn.query(
          'UPDATE books SET available_copies = available_copies + 1 WHERE id = ?',
          [book_id]
        );
      }

      await conn.query(
        'UPDATE reservations SET status = ? WHERE id = ?',
        [status, reservation_id]
      );

      await conn.commit();

      return res.json({ message: 'Статус обновлен' });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка' });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { title, author, description, category, image_url, total_copies } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'Заполните обязательные поля' });
    }

    const conn = await pool.getConnection();

    try {
      const [result] = await conn.query(
        `INSERT INTO books (title, author, description, category, image_url, total_copies, available_copies) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, author, description || null, category || null, image_url || null, total_copies || 5, total_copies || 5]
      );

      return res.status(201).json({
        message: 'Книга добавлена',
        book_id: result.insertId
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка' });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book_id = req.params.id;
    const { title, author, total_copies, available_copies } = req.body;

    const conn = await pool.getConnection();

    try {
      let updates = [];
      let params = [];

      if (title) {
        updates.push('title = ?');
        params.push(title);
      }
      if (author) {
        updates.push('author = ?');
        params.push(author);
      }
      if (total_copies !== undefined) {
        updates.push('total_copies = ?');
        params.push(total_copies);
      }
      if (available_copies !== undefined) {
        updates.push('available_copies = ?');
        params.push(available_copies);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'Нет данных' });
      }

      params.push(book_id);
      const query = 'UPDATE books SET ' + updates.join(', ') + ' WHERE id = ?';

      await conn.query(query, params);

      return res.json({ message: 'Книга обновлена' });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка' });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book_id = req.params.id;
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      await conn.query('DELETE FROM book_ratings WHERE book_id = ?', [book_id]);
      await conn.query('DELETE FROM favorites WHERE book_id = ?', [book_id]);
      await conn.query('DELETE FROM reservations WHERE book_id = ?', [book_id]);
      await conn.query('DELETE FROM books WHERE id = ?', [book_id]);

      await conn.commit();

      return res.json({ message: 'Книга удалена' });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка' });
  }
};