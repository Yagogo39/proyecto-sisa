const express = require('express');
const cors = require('cors');
const userRouter = require('./src/routes/user.routes');
const { connectDB } = require('./src/config/db');
const categoriaRoutes = require('./src/routes/categoria.routes');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/user', userRouter);
app.use('/categorias', categoriaRoutes);

function initServer() {
  app.listen(3000, () =>
    console.log('Servidor corriendo en http://localhost:3000/\nhttp://localhost:3000/user\nhttp://localhost:3000/categorias')
  );
}

connectDB(initServer);
