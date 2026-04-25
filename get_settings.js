
const { Client } = require('pg');

async function getSettings() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'cityhomes_hrms',
  });

  try {
    await client.connect();
    const res = await client.query("SELECT key, value FROM settings WHERE key LIKE 'salary_%' OR key LIKE 'holiday_%'");
    console.log('Settings:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

getSettings();
