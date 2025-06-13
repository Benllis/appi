require('dotenv').config();
const session = require('express-session');
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const tiendaRoutes = require('./routes/tienda.routes');

app.use(session({
  secret: 'datos_user',
  resave: false,
  saveUninitialized: false
}));

// Configuración del motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src')));

app.use('/', require('./routes/auth.routes'));
app.use('/usuarios', require('./routes/usuarios.routes'));
app.use('/', tiendaRoutes);
// Ruta raíz
app.get('/', (req, res) => {
  res.send('¡API funcionando correctamente!');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/login`);
});