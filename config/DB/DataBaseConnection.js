
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://frank:EifLcf9v4iaLwFXN@shop.wiqvq.mongodb.net/?retryWrites=true&w=majority&appName=Shop";


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const DataBaseConnection = async () => {
  try {
    await client.connect();
    const db = client.db('Tienda');
    return db;
  } catch (error) {
    console.error("Fallo al conectar con la Base de datos", error);
  }
};

const DataBaseUser = async () => {
  try {
    await client.connect();
    const db = client.db('usuarios');
    return db;
  } catch (error) {
    console.error("Fallo al conectar con la Base de datos:", error);
  }
};

module.exports = { DataBaseConnection, DataBaseUser };

