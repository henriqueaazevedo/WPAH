const { conectar } = require('../db/connection');

function semMongoId(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest;
}

async function lerColecao(nome) {
  const db = await conectar();
  const itens = await db.collection(nome).find({}).toArray();
  return itens.map(semMongoId);
}

async function salvarColecao(nome, dados) {
  const db = await conectar();
  const collection = db.collection(nome);
  await collection.deleteMany({});
  if (dados.length > 0) {
    await collection.insertMany(dados.map(semMongoId));
  }
}

function gerarId(lista) {
  if (!Array.isArray(lista) || lista.length === 0) return 1;
  return Math.max(...lista.map(item => Number(item.id) || 0)) + 1;
}

module.exports = {
  lerColecao,
  salvarColecao,
  gerarId
};
