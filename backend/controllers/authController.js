const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.register = async (req, res) => {
  try {
    const { login, email, password, full_name } = req.body;

    if (!login || !email || !password) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }

    const conn = await pool.getConnection();

    try {
      const [existingUser] = await conn.query(
        'SELECT id FROM users WHERE login = ? OR email = ?',
        [login, email]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Пользователь уже существует' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await conn.query(
        'INSERT INTO users (login, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
        [login, email, hashedPassword, full_name || login, 'student']
      );

      const token = jwt.sign(
        { id: result.insertId, login, role: 'student' },
        process.env.JWT_SECRET || 'secret-key',
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'Пользователь создан',
        token,
        user: { id: result.insertId, login, role: 'student' }
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }

    const conn = await pool.getConnection();

    try {
      const [users] = await conn.query(
        'SELECT id, login, password, role FROM users WHERE login = ?',
        [login]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Неверные данные' });
      }

      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Неверные данные' });
      }

      const token = jwt.sign(
        { id: user.id, login: user.login, role: user.role },
        process.env.JWT_SECRET || 'secret-key',
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: { id: user.id, login: user.login, role: user.role }
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
};