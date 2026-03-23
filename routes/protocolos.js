const { lerColecao, salvarColecao, gerarId } = require('../utils/mongoStorage');
const { correspondeBusca, dentroDoPeriodo } = require('../utils/filtros');

const ARQUIVO = 'protocolos.json';
const ARQUIVO_PESSOAS = 'pessoas.json';

function obterQuery(req) {
  return new URL(req.url, 'http://localhost').searchParams;
}

function gerarNumeroProtocolo(lista) {
  const ano = new Date().getFullYear();
  const sequencial = String(lista.length + 1).padStart(4, '0');
  return `PR-${ano}-${sequencial}`;
}

async function listarProtocolos(req, res) {
  const query = obterQuery(req);
  const termo = query.get('q') || '';
  const dataInicio = query.get('startDate') || '';
  const dataFim = query.get('endDate') || '';

  const protocolos = (await lerColecao('protocolos')).filter(protocolo => {
    return correspondeBusca(protocolo, termo, ['numero', 'titulo', 'tipo', 'situacao', 'descricao', 'conteudo'])
      && dentroDoPeriodo(protocolo, ['dataProtocolo', 'criadoEm', 'atualizadoEm'], dataInicio, dataFim);
  });

  responder(res, 200, protocolos);
}

async function buscarProtocolo(req, res, id) {
  const protocolos = await lerColecao('protocolos');
  const protocolo = protocolos.find(item => item.id === id);
  if (!protocolo) return responder(res, 404, { erro: 'Protocolo não encontrado' });
  responder(res, 200, protocolo);
}

async function criarProtocolo(req, res, body) {
  const { titulo, tipo, descricao, pessoaId, conteudo, situacao, dataProtocolo } = body;
  if (!titulo || !tipo) return responder(res, 400, { erro: 'Título e tipo são obrigatórios' });

  if (pessoaId) {
    const pessoas = await lerColecao('pessoas');
    const pessoa = pessoas.find(item => item.id === pessoaId);
    if (!pessoa) return responder(res, 404, { erro: 'Pessoa não encontrada para vincular' });
  }

  const protocolos = await lerColecao('protocolos');
  const novoProtocolo = {
    id: gerarId(protocolos),
    numero: gerarNumeroProtocolo(protocolos),
    titulo,
    tipo,
    descricao: descricao || null,
    pessoaId: pessoaId || null,
    conteudo: conteudo || null,
    situacao: situacao || 'Em análise',
    dataProtocolo: dataProtocolo || new Date().toISOString().slice(0, 10),
    criadoEm: new Date().toISOString()
  };

  protocolos.push(novoProtocolo);
  await salvarColecao('protocolos', protocolos);
  responder(res, 201, novoProtocolo);
}

async function atualizarProtocolo(req, res, id, body) {
  const protocolos = await lerColecao('protocolos');
  const index = protocolos.findIndex(item => item.id === id);
  if (index === -1) return responder(res, 404, { erro: 'Protocolo não encontrado' });

  const { titulo, tipo, descricao, pessoaId, conteudo, situacao, dataProtocolo } = body;

  if (pessoaId) {
    const pessoas = await lerColecao('pessoas');
    const pessoa = pessoas.find(item => item.id === pessoaId);
    if (!pessoa) return responder(res, 404, { erro: 'Pessoa não encontrada para vincular' });
  }

  protocolos[index] = {
    ...protocolos[index],
    titulo: titulo || protocolos[index].titulo,
    tipo: tipo || protocolos[index].tipo,
    descricao: descricao !== undefined ? descricao : protocolos[index].descricao,
    pessoaId: pessoaId !== undefined ? pessoaId : protocolos[index].pessoaId,
    conteudo: conteudo !== undefined ? conteudo : protocolos[index].conteudo,
    situacao: situacao || protocolos[index].situacao,
    dataProtocolo: dataProtocolo || protocolos[index].dataProtocolo,
    atualizadoEm: new Date().toISOString()
  };

  await salvarColecao('protocolos', protocolos);
  responder(res, 200, protocolos[index]);
}

async function deletarProtocolo(req, res, id) {
  const protocolos = await lerColecao('protocolos');
  const index = protocolos.findIndex(item => item.id === id);
  if (index === -1) return responder(res, 404, { erro: 'Protocolo não encontrado' });

  const removido = protocolos.splice(index, 1)[0];
  await salvarColecao('protocolos', protocolos);
  responder(res, 200, { mensagem: 'Protocolo removido com sucesso', protocolo: removido });
}

function responder(res, status, dados) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(dados));
}

module.exports = {
  listarProtocolos,
  buscarProtocolo,
  criarProtocolo,
  atualizarProtocolo,
  deletarProtocolo
};
