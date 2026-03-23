const { conectar, desconectar, obterDb } = require('./connection');
const fs = require('fs');
const path = require('path');

const COLECOES = {
  pessoas: 'pessoas',
  usuarios: 'usuarios',
  documentos: 'documentos',
  protocolos: 'protocolos'
};

async function criarIndices() {
  const db = obterDb();

  try {
    // Índices para pessoas
    await db.collection(COLECOES.pessoas).createIndex({ cpf: 1 }, { unique: true });
    console.log('  ✓ Índice único criado em pessoas.cpf');

    // Índices para usuarios
    await db.collection(COLECOES.usuarios).createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('  ✓ Índice único criado em usuarios.email');

    await db.collection(COLECOES.usuarios).createIndex({ login: 1 }, { unique: true });
    console.log('  ✓ Índice único criado em usuarios.login');

    // Índices para documentos
    await db.collection(COLECOES.documentos).createIndex({ pessoaId: 1 });
    console.log('  ✓ Índice criado em documentos.pessoaId');

    // Índices para protocolos
    await db.collection(COLECOES.protocolos).createIndex({ numero: 1 }, { unique: true });
    console.log('  ✓ Índice único criado em protocolos.numero');

    await db.collection(COLECOES.protocolos).createIndex({ pessoaId: 1 });
    console.log('  ✓ Índice criado em protocolos.pessoaId');

  } catch (erro) {
    if (erro.message.includes('already exists')) {
      console.log('  ℹ Índices já existem');
    } else {
      throw erro;
    }
  }
}

async function migrarDados() {
  const db = obterDb();
  const dataPath = path.join(__dirname, '..', 'data');

  // Helper para verificar se arquivo existe e retornar dados
  function carregarJSON(nomeArquivo) {
    try {
      const caminhoCompleto = path.join(dataPath, nomeArquivo);
      const dados = JSON.parse(fs.readFileSync(caminhoCompleto, 'utf-8'));
      return Array.isArray(dados) ? dados : [];
    } catch {
      return [];
    }
  }

  const colecoes = [
    { arquivo: 'pessoas.json', colecao: COLECOES.pessoas },
    { arquivo: 'usuarios.json', colecao: COLECOES.usuarios },
    { arquivo: 'documentos.json', colecao: COLECOES.documentos },
    { arquivo: 'protocolos.json', colecao: COLECOES.protocolos }
  ];

  for (const { arquivo, colecao } of colecoes) {
    try {
      const dados = carregarJSON(arquivo);

      if (dados.length === 0) {
        console.log(`  ℹ ${arquivo} vazio ou não encontrado`);
        continue;
      }

      const collection = db.collection(colecao);
      const count = await collection.countDocuments();

      if (count === 0) {
        // Inserir dados se a coleção está vazia
        const resultado = await collection.insertMany(dados);
        console.log(`  ✓ ${dados.length} registros importados para ${colecao}`);
      } else {
        console.log(`  ℹ ${colecao} já contém ${count} registros (importação pulada)`);
      }
    } catch (erro) {
      console.error(`  ✗ Erro ao migrar ${arquivo}:`, erro.message);
    }
  }
}

async function inicializar() {
  try {
    console.log('📦 Inicializando MongoDB...\n');

    // Conectar
    await conectar();

    // Obter referência do DB
    const db = obterDb();

    // Criar coleções se não existirem
    console.log('Criando coleções...');
    for (const [key, nomeColecao] of Object.entries(COLECOES)) {
      try {
        await db.createCollection(nomeColecao);
        console.log(`  ✓ Coleção criada: ${nomeColecao}`);
      } catch (erro) {
        if (erro.message.includes('already exists')) {
          console.log(`  ℹ Coleção já existe: ${nomeColecao}`);
        } else {
          throw erro;
        }
      }
    }

    // Criar índices
    console.log('\nCriando índices...');
    await criarIndices();

    // Migrar dados
    console.log('\nMigrando dados...');
    await migrarDados();

    console.log('\n✅ Banco de dados inicializado com sucesso!\n');
    console.log('Você pode agora:');
    console.log('  1. Visualizar as coleções no MongoDB Compass');
    console.log('  2. Executar: npm start');
    console.log('');

    await desconectar();
  } catch (erro) {
    console.error('\n❌ Erro durante inicialização:', erro.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  inicializar();
}

module.exports = { inicializar };
