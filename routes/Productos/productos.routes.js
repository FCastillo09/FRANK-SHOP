const express = require('express');
const { DataBaseConnection} = require('../../config/DB/DataBaseConnection');
const ProductosRouter = express.Router();


ProductosRouter.get('/disponibles', async (req, res) => {

  const db = await DataBaseConnection();
  const productos = await db.collection('productos').find().toArray();
  res.json({ message :"Listado de Productos disponibles:",productos });

});

module.exports = ProductosRouter;
