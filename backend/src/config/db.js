const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

function getDbPath() {
  if (process.env.DB_PATH) {
    return process.env.DB_PATH;
  }
  if (process.pkg) {
    const exeDir = path.dirname(process.execPath);
    return path.join(exeDir, 'sistema_cyber.db');
  }
  return path.join(__dirname, '..', '..', 'sistema_cyber.db');
}

function getSchemaPath() {
  if (process.pkg) {
    const exeDir = path.dirname(process.execPath);
    const externo = path.join(exeDir, 'schema.sql');
    if (fs.existsSync(externo)) return externo;
    return path.join(__dirname, '..', '..', 'schema.sql');
  }
  return path.join(__dirname, '..', '..', 'schema.sql');
}

const dbPath = getDbPath();
const schemaPath = getSchemaPath();

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
    console.log('BD creada desde schema.sql');
  }
  return db;
}

function connectDB(callback) {
  conectar().then(callback).catch((err) => console.error(err));
}

module.exports = { conectar, connectDB };