const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor SIS-A funcionando');
});

app.listen(3000, () => console.log('Server listo en puerto 3000'));
