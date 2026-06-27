const mysql = require('mysql2/promise');
require('dotenv').config();

// Connect using MYSQL_URL (provided by Railway MySQL) or fallback to local credentials
const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;

const pool = connectionString
  ? mysql.createPool(connectionString)
  : mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'portfolio_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

// Test connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL database connected successfully!');
    connection.release();
  } catch (error) {
    console.error('MySQL database connection failed:', error.message);
  }
})();

module.exports = pool;

