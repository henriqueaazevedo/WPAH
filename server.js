const http = require('http');
const pessoas = require('./routes/pessoas');
const documentos = require('./routes/documentos');
const auth = require('./routes/auth');

const PORTA = 3000;

function lerBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('JSON inválido'));
      }
    });
    req.on('error', reject);
  });
}

function extrairId(partes, posicao) {
  const id = parseInt(partes[posicao]);
  return isNaN(id) ? null : id;
}

function responderErro(res, status, mensagem) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ erro: mensagem }));
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  const partes = url.split('/').filter(Boolean);

  // CORS simples para facilitar testes via ferramentas externas
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  try {
    // ============================================================
    // ROTAS DE AUTENTICAÇÃO
    // POST /cadastro
    // POST /login
    // GET  /usuarios
    // ============================================================
    if (partes[0] === 'cadastro' && method === 'POST') {
      const body = await lerBody(req);
      return auth.cadastrar(req, res, body);
    }

    if (partes[0] === 'login' && method === 'POST') {
      const body = await lerBody(req);
      return auth.login(req, res, body);
    }

    if (partes[0] === 'usuarios' && method === 'GET') {
      return auth.listarUsuarios(req, res);
    }

    // ============================================================
    // ROTAS DE PESSOAS
    // GET    /pessoas
    // GET    /pessoas/:id
    // POST   /pessoas
    // PUT    /pessoas/:id
    // DELETE /pessoas/:id
    // GET    /pessoas/:id/documentos
    // ============================================================
    if (partes[0] === 'pessoas') {
      const id = partes[1] ? extrairId(partes, 1) : null;

      // GET /pessoas/:id/documentos
      if (method === 'GET' && id && partes[2] === 'documentos') {
        return documentos.listarDocumentosDaPessoa(req, res, id);
      }

      if (method === 'GET' && !id) return pessoas.listarPessoas(req, res);
      if (method === 'GET' && id) return pessoas.buscarPessoa(req, res, id);

      if (method === 'POST') {
        const body = await lerBody(req);
        return pessoas.criarPessoa(req, res, body);
      }

      if (method === 'PUT' && id) {
        const body = await lerBody(req);
        return pessoas.atualizarPessoa(req, res, id, body);
      }

      if (method === 'DELETE' && id) return pessoas.deletarPessoa(req, res, id);
    }

    // ============================================================
    // ROTAS DE DOCUMENTOS
    // GET    /documentos
    // GET    /documentos/:id
    // POST   /documentos
    // PUT    /documentos/:id
    // DELETE /documentos/:id
    // ============================================================
    if (partes[0] === 'documentos') {
      const id = partes[1] ? extrairId(partes, 1) : null;

      if (method === 'GET' && !id) return documentos.listarDocumentos(req, res);
      if (method === 'GET' && id) return documentos.buscarDocumento(req, res, id);

      if (method === 'POST') {
        const body = await lerBody(req);
        return documentos.criarDocumento(req, res, body);
      }

      if (method === 'PUT' && id) {
        const body = await lerBody(req);
        return documentos.atualizarDocumento(req, res, id, body);
      }

      if (method === 'DELETE' && id) return documentos.deletarDocumento(req, res, id);
    }

    // Rota raiz — lista rotas disponíveis
    if (url === '/' || url === '') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        sistema: 'Gestão de Pessoas e Documentos',
        versao: '1.0.0',
        rotas: {
          autenticacao: {
            'POST /cadastro': 'Criar conta { nome, email, senha }',
            'POST /login': 'Entrar { email, senha }',
            'GET /usuarios': 'Listar usuários cadastrados'
          },
          pessoas: {
            'GET /pessoas': 'Listar todas as pessoas',
            'GET /pessoas/:id': 'Buscar pessoa por ID',
            'POST /pessoas': 'Criar pessoa { nome, cpf, email?, telefone?, dataNascimento? }',
            'PUT /pessoas/:id': 'Atualizar pessoa',
            'DELETE /pessoas/:id': 'Remover pessoa',
            'GET /pessoas/:id/documentos': 'Documentos vinculados a uma pessoa'
          },
          documentos: {
            'GET /documentos': 'Listar todos os documentos',
            'GET /documentos/:id': 'Buscar documento por ID',
            'POST /documentos': 'Criar documento { titulo, tipo, descricao?, pessoaId?, conteudo? }',
            'PUT /documentos/:id': 'Atualizar documento',
            'DELETE /documentos/:id': 'Remover documento'
          }
        }
      }, null, 2));
    }

    responderErro(res, 404, 'Rota não encontrada');
  } catch (err) {
    responderErro(res, 400, err.message || 'Erro ao processar requisição');
  }
});

server.listen(PORTA, () => {
  console.log(`\n========================================`);
  console.log(`  Sistema de Gestão de Pessoas e Docs  `);
  console.log(`  Servidor rodando em http://localhost:${PORTA}`);
  console.log(`========================================\n`);
  console.log('Rotas disponíveis:');
  console.log('  POST   /cadastro');
  console.log('  POST   /login');
  console.log('  GET    /usuarios');
  console.log('  ---');
  console.log('  GET    /pessoas');
  console.log('  GET    /pessoas/:id');
  console.log('  POST   /pessoas');
  console.log('  PUT    /pessoas/:id');
  console.log('  DELETE /pessoas/:id');
  console.log('  GET    /pessoas/:id/documentos');
  console.log('  ---');
  console.log('  GET    /documentos');
  console.log('  GET    /documentos/:id');
  console.log('  POST   /documentos');
  console.log('  PUT    /documentos/:id');
  console.log('  DELETE /documentos/:id\n');
});
