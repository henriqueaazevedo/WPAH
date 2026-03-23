const { conectar, desconectar, obterClient, DB_NAME } = require('./connection');

async function limparBancoDados() {
  try {
    await conectar();
    const client = obterClient();
    await client.db(DB_NAME).dropDatabase();
    console.log(`✅ Banco '${DB_NAME}' removido com sucesso`);
  } catch (erro) {
    console.error('❌ Falha ao limpar banco:', erro.message);
    process.exitCode = 1;
  } finally {
    await desconectar();
  }
}

if (require.main === module) {
  limparBancoDados();
}

module.exports = { limparBancoDados };
