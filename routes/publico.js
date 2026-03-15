const { lerArquivo } = require('../utils/storage');
const { correspondeBusca, dentroDoPeriodo } = require('../utils/filtros');

function obterQuery(req) {
  return new URL(req.url, 'http://localhost').searchParams;
}

function buscar(req, res) {
  const query = obterQuery(req);
  const termo = query.get('q') || '';
  const dataInicio = query.get('startDate') || '';
  const dataFim = query.get('endDate') || '';

  const pessoas = lerArquivo('pessoas.json').filter(item => {
    return correspondeBusca(item, termo, ['nome', 'cpf', 'email', 'telefone'])
      && dentroDoPeriodo(item, ['dataNascimento', 'criadoEm'], dataInicio, dataFim);
  });

  const documentos = lerArquivo('documentos.json').filter(item => {
    return correspondeBusca(item, termo, ['titulo', 'tipo', 'descricao', 'conteudo'])
      && dentroDoPeriodo(item, ['criadoEm', 'atualizadoEm'], dataInicio, dataFim);
  });

  const protocolos = lerArquivo('protocolos.json').filter(item => {
    return correspondeBusca(item, termo, ['numero', 'titulo', 'tipo', 'descricao', 'conteudo', 'situacao'])
      && dentroDoPeriodo(item, ['dataProtocolo', 'criadoEm', 'atualizadoEm'], dataInicio, dataFim);
  });

  responder(res, 200, {
    filtro: { termo, dataInicio, dataFim },
    resumo: {
      pessoas: pessoas.length,
      documentos: documentos.length,
      protocolos: protocolos.length,
      total: pessoas.length + documentos.length + protocolos.length
    },
    pessoas,
    documentos,
    protocolos
  });
}

function listarServicos(req, res) {
  responder(res, 200, [
    {
      id: 1,
      titulo: 'Cadastro de Pessoas',
      descricao: 'Registrar, consultar e manter dados cadastrais de cidadãos e servidores.',
      rota: '/pessoas'
    },
    {
      id: 2,
      titulo: 'Gestão de Documentos',
      descricao: 'Criar, localizar e atualizar documentos administrativos e normativos.',
      rota: '/documentos'
    },
    {
      id: 3,
      titulo: 'Controle de Protocolos',
      descricao: 'Acompanhar solicitações, tramitações e status de protocolos.',
      rota: '/protocolos'
    },
    {
      id: 4,
      titulo: 'Perfil do Usuário',
      descricao: 'Atualizar dados pessoais e senha de acesso.',
      rota: '/perfil'
    }
  ]);
}

function transparencia(req, res) {
  const pessoas = lerArquivo('pessoas.json');
  const documentos = lerArquivo('documentos.json');
  const protocolos = lerArquivo('protocolos.json');
  const usuarios = lerArquivo('usuarios.json');

  responder(res, 200, {
    totais: {
      pessoas: pessoas.length,
      documentos: documentos.length,
      protocolos: protocolos.length,
      usuarios: usuarios.length
    },
    ultimosCadastros: {
      pessoas: pessoas.slice(-5).reverse(),
      documentos: documentos.slice(-5).reverse(),
      protocolos: protocolos.slice(-5).reverse()
    }
  });
}

function responder(res, status, dados) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(dados));
}

module.exports = {
  buscar,
  listarServicos,
  transparencia
};
