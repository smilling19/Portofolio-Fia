const { Pool } = require('pg');
require('dotenv').config();

// Connect using DATABASE_URL (provided by Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for secure connection to Supabase
  }
});

// Helper to convert mysql "?" placeholders to postgres "$1, $2, ..."
function convertQuery(text) {
  let index = 1;
  return text.replace(/\?/g, () => `$${index++}`);
}

module.exports = {
  query: async (text, params) => {
    const postgresText = convertQuery(text);
    
    const isInsert = text.trim().toLowerCase().startsWith('insert');
    const isUpdateOrDelete = text.trim().toLowerCase().startsWith('update') || text.trim().toLowerCase().startsWith('delete');
    
    let queryText = postgresText;
    // For inserts, PostgreSQL doesn't automatically return insertId, so we append RETURNING id
    if (isInsert && !postgresText.toLowerCase().includes('returning')) {
      queryText += ' RETURNING id';
    }

    const res = await pool.query(queryText, params);

    // Mock mysql2 query output structure: [result, fields]
    if (isInsert) {
      const insertId = res.rows[0] ? res.rows[0].id : null;
      return [{ insertId, affectedRows: res.rowCount }, res.fields];
    }
    
    if (isUpdateOrDelete) {
      return [{ affectedRows: res.rowCount, changedRows: res.rowCount }, res.fields];
    }

    // For SELECT queries, return [rows, fields]
    return [res.rows, res.fields];
  },
  
  // Keep compatibility for testing connection
  getConnection: async () => {
    const client = await pool.connect();
    return {
      query: async (text, params) => {
        const postgresText = convertQuery(text);
        const isInsert = text.trim().toLowerCase().startsWith('insert');
        
        let queryText = postgresText;
        if (isInsert && !postgresText.toLowerCase().includes('returning')) {
          queryText += ' RETURNING id';
        }
        
        const res = await client.query(queryText, params);
        
        const isUpdateOrDelete = text.trim().toLowerCase().startsWith('update') || text.trim().toLowerCase().startsWith('delete');
        if (isInsert) {
          const insertId = res.rows[0] ? res.rows[0].id : null;
          return [{ insertId, affectedRows: res.rowCount }, res.fields];
        }
        if (isUpdateOrDelete) {
          return [{ affectedRows: res.rowCount, changedRows: res.rowCount }, res.fields];
        }
        return [res.rows, res.fields];
      },
      release: () => client.release()
    };
  }
};

// Test connection on startup
(async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL (Supabase) database connected successfully!');
    client.release();
  } catch (error) {
    console.error('PostgreSQL (Supabase) database connection failed:', error.message);
  }
})();

