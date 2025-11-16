const { Pool } = require("pg");

// Smart configuration that works everywhere
const getDbConfig = () => {
  // 1. Render Production (uses DATABASE_URL)
  if (process.env.DATABASE_URL) {
    console.log('Using Render Postgres');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    };
  }
  
  // 2. Local Development (uses .env file)
  console.log('Using Local Postgres');
  return {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
  };
};

const pool = new Pool(getDbConfig());

module.exports = pool; 