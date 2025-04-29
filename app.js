require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

connection.connect((err) => {
  if (err) {
    console.error('Error de conexión:', {
      code: err.code,
      errno: err.errno
    });
    return;
  }
  console.log('Estas conectado');
});

app.use(express.json());
  
app.listen(PORT, () => {
  console.log(`Servidor corriendo http://localhost:${PORT}`);
});

app.get('/prueba', (req, res) => {
    connection.ping(err => {
      const dbStatus = err ? 'disconnected' : 'connected';
      
      res.json({
        status: 'success',
        dbConnection: dbStatus,
        dbDetails: {
          host: process.env.DB_HOST,
          database: process.env.DB_NAME,
          port: process.env.DB_PORT
        }
      });
    });
  });
