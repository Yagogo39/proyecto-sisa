const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10; // Nivel de dificultad del hash

async function hashearContrasena(contrasenaPlana) {
  return await bcrypt.hash(contrasenaPlana, SALT_ROUNDS);
}

async function verificarContrasena(contrasenaPlana, hashGuardado) {
  return await bcrypt.compare(contrasenaPlana, hashGuardado);
}

module.exports = { hashearContrasena, verificarContrasena };