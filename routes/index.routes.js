const express = require('express');
const ProductosRouter = require('./Productos/productos.routes');
const router = express.Router();

router.use('/productos/', ProductosRouter )
module.exports = router