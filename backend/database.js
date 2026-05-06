const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'sistema_cyber.db');
const schemaPath = path.join(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Error al abrir DB:", err.message);
});

// Inicialización limpia
db.serialize(() => {
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema, (err) => {
      if (err) console.error("Error en schema:", err.message);
      else console.log("DB sincronizada con schema.sql");
    });
  }
});

module.exports = db;
