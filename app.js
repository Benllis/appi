require('dotenv').config();
const express = require('express');


const app = express();
const PORT = process.env.PORT || 3000;


const connection = require('./config/config');
const usuariosRouter = require('./controllers/usuarios.controller');


app.listen(PORT, () => {
  console.log(`Servidor corriendo http://localhost:${PORT}`);
});
app.use(express.json());


app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/marcas', require('./routes/marcas.routes'));
app.use('/api/pedidos', require('./routes/pedidos.routes'));
