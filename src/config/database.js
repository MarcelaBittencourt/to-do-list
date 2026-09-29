const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (error) => {
  console.error('Erro inesperado no pool do PostgreSQL:', error);
});

module.exports = pool;
