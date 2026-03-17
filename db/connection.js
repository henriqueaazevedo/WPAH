const { MongoClient } = require('mongodb');

require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wpah';
const DB_NAME = 'wpah';

let client = null;
let db = null;

async function conectar() {
  if (client && client.topology && client.topology.isConnected()) {
    return db;
  }

  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`✓ Conectado ao MongoDB: ${MONGO_URI}`);
    return db;
  } catch (erro) {
    console.error('✗ Erro ao conectar ao MongoDB:', erro.message);
    throw erro;
  }
}

async function desconectar() {
  if (client) {
    await client.close();
    console.log('✓ Desconectado do MongoDB');
    client = null;
    db = null;
  }
}

function obterDb() {
  if (!db) {
    throw new Error('Banco de dados não conectado. Execute conectar() primeiro.');
  }
  return db;
}

function obterClient() {
  if (!client) {
    throw new Error('Cliente MongoDB não inicializado. Execute conectar() primeiro.');
  }
  return client;
}

module.exports = {
  conectar,
  desconectar,
  obterDb,
  obterClient,
  MONGO_URI,
  DB_NAME
};
