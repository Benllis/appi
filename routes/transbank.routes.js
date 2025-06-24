const express = require('express');
const router = express.Router();

router.get('/cmf', (req, res) => {
  // Lógica para obtener datos CMF o mostrar la plantilla
  res.render('transbank/cmf', {
    // datos que quieras pasar a la plantilla
  });
});

module.exports = router;