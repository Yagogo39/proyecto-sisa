const jwt = require('jsonwebtoken');

const JWT_SECRET = 'sis-a-papeleria-don-max-2026';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No autorizado por falla de token' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No autorizado por falla de token' });
  }

  try {
    const datos = jwt.verify(token, JWT_SECRET);
    req.usuario = datos;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'No autorizado por falla de token' });
  }
};

module.exports = { authMiddleware };