const { handleRequest } = require('../app');
const { conectar } = require('../db/connection');

module.exports = async (req, res) => {
  try {
    await conectar();
  } catch (erro) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      erro: 'Falha na conexão com o banco de dados',
      detalhe: erro.message
    }));
  }

  return handleRequest(req, res, { basePath: '/api' });
};