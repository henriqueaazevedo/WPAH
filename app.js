const pessoas = require('./routes/pessoas');
const documentos = require('./routes/documentos');
const protocolos = require('./routes/protocolos');
const publico = require('./routes/publico');
const auth = require('./routes/auth');

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
  const id = parseInt(partes[posicao], 10);
  return Number.isNaN(id) ? null : id;
}

function responderErro(res, status, mensagem) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ erro: mensagem }));
}

function limparPrefixo(pathname, prefixo) {
  if (!prefixo) return pathname;
  if (pathname === prefixo) return '/';
  if (pathname.startsWith(`${prefixo}/`)) {
    return pathname.slice(prefixo.length) || '/';
  }
  return pathname;
}

async function handleRequest(req, res, options = {}) {
  const prefixo = options.basePath || '';
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathnameOriginal = parsedUrl.pathname;
  const pathname = limparPrefixo(pathnameOriginal, prefixo);

  if (prefixo && pathname === pathnameOriginal) {
    return responderErro(res, 404, 'Rota não encontrada');
  }

  const partes = pathname.split('/').filter(Boolean);
  const { method } = req;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  try {
    if (partes[0] === 'cadastro' && method === 'POST') {
      const body = await lerBody(req);
      return await auth.cadastrar(req, res, body);
    }

    if (partes[0] === 'login' && method === 'POST') {
      const body = await lerBody(req);
      return await auth.login(req, res, body);
    }

    if (partes[0] === 'usuarios' && method === 'GET' && partes.length === 1) {
      return await auth.listarUsuarios(req, res);
    }

    if (partes[0] === 'perfil') {
      const id = extrairId(partes, 1);
      if (!id) return responderErro(res, 400, 'ID de usuário inválido');

      if (method === 'GET') return await auth.buscarPerfil(req, res, id);
      if (method === 'PUT') {
        const body = await lerBody(req);
        return await auth.atualizarPerfil(req, res, id, body);
      }
    }

    if (partes[0] === 'busca' && method === 'GET') {
      return await publico.buscar(req, res);
    }

    if (partes[0] === 'servicos' && method === 'GET') {
      return await publico.listarServicos(req, res);
    }

    if (partes[0] === 'transparencia' && method === 'GET') {
      return await publico.transparencia(req, res);
    }

    if (partes[0] === 'pessoas') {
      const id = partes[1] ? extrairId(partes, 1) : null;

      if (method === 'GET' && id && partes[2] === 'documentos') {
        return await documentos.listarDocumentosDaPessoa(req, res, id);
      }

      if (method === 'GET' && !id) return await pessoas.listarPessoas(req, res);
      if (method === 'GET' && id) return await pessoas.buscarPessoa(req, res, id);

      if (method === 'POST') {
        const body = await lerBody(req);
        return await pessoas.criarPessoa(req, res, body);
      }

      if (method === 'PUT' && id) {
        const body = await lerBody(req);
        return await pessoas.atualizarPessoa(req, res, id, body);
      }

      if (method === 'DELETE' && id) return await pessoas.deletarPessoa(req, res, id);
    }

    if (partes[0] === 'documentos') {
      const id = partes[1] ? extrairId(partes, 1) : null;

      if (method === 'GET' && !id) return await documentos.listarDocumentos(req, res);
      if (method === 'GET' && id) return await documentos.buscarDocumento(req, res, id);

      if (method === 'POST') {
        const body = await lerBody(req);
        return await documentos.criarDocumento(req, res, body);
      }

      if (method === 'PUT' && id) {
        const body = await lerBody(req);
        return await documentos.atualizarDocumento(req, res, id, body);
      }

      if (method === 'DELETE' && id) return await documentos.deletarDocumento(req, res, id);
    }

    if (partes[0] === 'protocolos') {
      const id = partes[1] ? extrairId(partes, 1) : null;

      if (method === 'GET' && !id) return await protocolos.listarProtocolos(req, res);
      if (method === 'GET' && id) return await protocolos.buscarProtocolo(req, res, id);

      if (method === 'POST') {
        const body = await lerBody(req);
        return await protocolos.criarProtocolo(req, res, body);
      }

      if (method === 'PUT' && id) {
        const body = await lerBody(req);
        return await protocolos.atualizarProtocolo(req, res, id, body);
      }

      if (method === 'DELETE' && id) return await protocolos.deletarProtocolo(req, res, id);
    }

    if (pathname === '/' || pathname === '') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        sistema: 'Gestão de Pessoas, Documentos e Protocolos',
        versao: '2.0.0',
        rotas: {
          autenticacao: {
            'POST /cadastro': 'Criar conta com pessoa vinculada',
            'POST /login': 'Entrar com email ou login',
            'GET /usuarios': 'Listar usuários cadastrados',
            'GET /perfil/:id': 'Buscar perfil do usuário',
            'PUT /perfil/:id': 'Atualizar perfil do usuário'
          },
          pessoas: {
            'GET /pessoas?q=&startDate=&endDate=': 'Listar pessoas com filtros',
            'GET /pessoas/:id': 'Buscar pessoa por ID',
            'POST /pessoas': 'Criar pessoa e gerar acesso automático',
            'PUT /pessoas/:id': 'Atualizar pessoa',
            'DELETE /pessoas/:id': 'Remover pessoa'
          },
          documentos: {
            'GET /documentos?q=&startDate=&endDate=': 'Listar documentos com filtros',
            'GET /documentos/:id': 'Buscar documento por ID',
            'POST /documentos': 'Criar documento',
            'PUT /documentos/:id': 'Atualizar documento',
            'DELETE /documentos/:id': 'Remover documento'
          },
          protocolos: {
            'GET /protocolos?q=&startDate=&endDate=': 'Listar protocolos com filtros',
            'GET /protocolos/:id': 'Buscar protocolo por ID',
            'POST /protocolos': 'Criar protocolo',
            'PUT /protocolos/:id': 'Atualizar protocolo',
            'DELETE /protocolos/:id': 'Remover protocolo'
          },
          portal: {
            'GET /busca?q=&startDate=&endDate=': 'Busca global em pessoas, documentos e protocolos',
            'GET /servicos': 'Listar serviços do portal',
            'GET /transparencia': 'Indicadores e últimos registros'
          }
        }
      }, null, 2));
    }

    responderErro(res, 404, 'Rota não encontrada');
  } catch (err) {
    responderErro(res, 400, err.message || 'Erro ao processar requisição');
  }
}

module.exports = {
  handleRequest
};