const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,      // Railway сам подставит mysql.railway.internal
  user: process.env.DB_USER,      // Railway сам подставит root
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,  // Railway сам подставит railway
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000 // Ждем 10 секунд, чтобы не "отвалиться" раньше времени
});

module.exports = pool;