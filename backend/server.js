const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'https://library-app-production-62cf.up.railway.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const reservationRoutes = require('./routes/reservations');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

const PORT = process.env.PORT || 3000;

// Важно: слушаем на '0.0.0.0', чтобы Railway мог прокинуть трафик
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Сервер реально запущен и слушает порт: ${PORT}`);
});