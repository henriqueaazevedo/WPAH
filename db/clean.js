const { conectar, desconectar, obterDb } = require('./connection');

async function limparBancoDados() {
  try {
    console.log('🗑️  Removendo banco de dados...\n');

    await conectar();
    const client = require('./connection').obterClient();

    // Remover banco inteiro
    await client.db('wpah').dropDatabase();

    console.log('✅ Banco de dados removido com sucesso!');
    console.log('\nAgora execute: npm run init-db\n');

    await desconectar();
  } catch (erro) {
    console.error('❌ Erro ao limpar banco:', erro.message);
    process.exit(1);
  }
}

if (require.main === module) {
  limparBancoDados();
}

module.exports = { limparBancoDados };
