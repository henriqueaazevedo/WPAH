const http = require('http');
const { handleRequest } = require('./app');
const { conectar } = require('./db/connection');

const PORTA = process.env.PORT || 3003;

const server = http.createServer((req, res) => handleRequest(req, res));

server.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});

// Inicializar conexão com MongoDB
conectar().catch(erro => {
  console.error('Erro ao conectar ao MongoDB. Verifique se o MongoDB está rodando e tente novamente.');
  console.error('Execute: npm run init-db');
  process.exit(1);
});
