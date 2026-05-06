const db = require('../config/db');

async function findAll() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM Temporada", [], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

async function create(nombre) {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO Temporada (nombre) VALUES (?)";
    db.run(query, [nombre], function (err) {
      if (err) reject(err);
      resolve({ idTemporada: this.lastID, nombre });
    });
  });
}

async function findById(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM Temporada WHERE idTemporada = ?", [id], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
}

module.exports = {
  findAll,
  create,
  findById
};
