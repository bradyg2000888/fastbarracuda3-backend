const { Pool } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); // ⬅️ Force IPv4 resolution

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
