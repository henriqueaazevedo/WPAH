const fs = require('fs');
const path = require('path');
const { conectar, desconectar, obterDb } = require('./connection');

const colecoes = ['pessoas', 'usuarios', 'documentos', 'protocolos'];

function carregarSeed(nome) {
  const arquivo = path.join(__dirname, '..', 'data', `${nome}.json`);
  if (!fs.existsSync(arquivo)) return [];
  try {
    const conteudo = fs.readFileSync(arquivo, 'utf-8');
    const json = JSON.parse(conteudo);
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

async function garantirColecoes(db) {
  const existentes = await db.listCollections({}, { nameOnly: true }).toArray();
  const nomes = new Set(existentes.map(c => c.name));

  for (const nome of colecoes) {
    if (!nomes.has(nome)) {
      await db.createCollection(nome);
      console.log(`✓ Coleção criada: ${nome}`);
    } else {
      console.log(`ℹ Coleção já existe: ${nome}`);
    }
  }
}

async function garantirIndices(db) {
  await db.collection('pessoas').createIndex({ id: 1 }, { unique: true });
  await db.collection('pessoas').createIndex({ cpf: 1 }, { unique: true, sparse: true });

  await db.collection('usuarios').createIndex({ id: 1 }, { unique: true });
  await db.collection('usuarios').createIndex({ login: 1 }, { unique: true, sparse: true });
  await db.collection('usuarios').createIndex({ email: 1 }, { unique: true, sparse: true });

  await db.collection('documentos').createIndex({ id: 1 }, { unique: true });
  await db.collection('protocolos').createIndex({ id: 1 }, { unique: true });
  await db.collection('protocolos').createIndex({ numero: 1 }, { unique: true, sparse: true });

  console.log('✓ Índices garantidos');
}

async function importarSeeds(db) {
  for (const nome of colecoes) {
    const seed = carregarSeed(nome);
    if (seed.length === 0) {
      console.log(`ℹ Sem seed para ${nome}`);
      continue;
    }

    const collection = db.collection(nome);
    const count = await collection.countDocuments();
    if (count > 0) {
      console.log(`ℹ ${nome} já possui ${count} registros`);
      continue;
    }

    await collection.insertMany(seed);
    console.log(`✓ Seed importado em ${nome}: ${seed.length} registros`);
  }
}

async function inicializar() {
  try {
    await conectar();
    const db = obterDb();

    await garantirColecoes(db);
    await garantirIndices(db);
    await importarSeeds(db);

    console.log('\n✅ Banco inicializado com sucesso');
  } catch (erro) {
    console.error('\n❌ Falha ao inicializar banco:', erro.message);
    process.exitCode = 1;
  } finally {
    await desconectar();
  }
}

if (require.main === module) {
  inicializar();
}

module.exports = { inicializar };
