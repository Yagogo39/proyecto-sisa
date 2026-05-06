const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', 'sistema_cyber.db');
const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');

let db = null;

async function conectar() {
  if (db) return db;

  db = await open({ filename: dbPath, driver: sqlite3.Database });
  await db.exec('PRAGMA foreign_keys = ON;');

  const tablaUsuario = await db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='Usuario'"
  );
  if (!tablaUsuario && fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await db.exec(schema);
  }

  return db;
}

function connectDB(callback) {
  conectar().then(callback).catch((err) => console.error(err));
}

module.exports = { conectar, connectDB };