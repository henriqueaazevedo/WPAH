const { lerArquivo, salvarArquivo, gerarId } = require('../utils/storage');
const { correspondeBusca, dentroDoPeriodo } = require('../utils/filtros');

const ARQUIVO = 'documentos.json';
const ARQUIVO_PESSOAS = 'pessoas.json';

function obterQuery(req) {
  return new URL(req.url, 'http://localhost').searchParams;
}

function listarDocumentos(req, res) {
  const query = obterQuery(req);
  const termo = query.get('q') || '';
  const dataInicio = query.get('startDate') || '';
  const dataFim = query.get('endDate') || '';

  const documentos = lerArquivo(ARQUIVO).filter(documento => {
    return correspondeBusca(documento, termo, ['titulo', 'tipo', 'descricao', 'conteudo'])
      && dentroDoPeriodo(documento, ['criadoEm', 'atualizadoEm'], dataInicio, dataFim);
  });

  responder(res, 200, documentos);
}

function buscarDocumento(req, res, id) {
  const documentos = lerArquivo(ARQUIVO);
  const doc = documentos.find(d => d.id === id);
  if (!doc) return responder(res, 404, { erro: 'Documento não encontrado' });
  responder(res, 200, doc);
}

function listarDocumentosDaPessoa(req, res, pessoaId) {
  const pessoas = lerArquivo(ARQUIVO_PESSOAS);
  const pessoa = pessoas.find(p => p.id === pessoaId);
  if (!pessoa) return responder(res, 404, { erro: 'Pessoa não encontrada' });

  const documentos = lerArquivo(ARQUIVO);
  const docsDaPessoa = documentos.filter(d => d.pessoaId === pessoaId);
  responder(res, 200, docsDaPessoa);
}

function criarDocumento(req, res, body) {
  const { titulo, tipo, descricao, pessoaId, conteudo } = body;
  if (!titulo || !tipo) return responder(res, 400, { erro: 'Título e tipo são obrigatórios' });

  if (pessoaId) {
    const pessoas = lerArquivo(ARQUIVO_PESSOAS);
    const pessoa = pessoas.find(p => p.id === pessoaId);
    if (!pessoa) return responder(res, 404, { erro: 'Pessoa não encontrada para vincular' });
  }

  const documentos = lerArquivo(ARQUIVO);
  const novoDoc = {
    id: gerarId(documentos),
    titulo,
    tipo,
    descricao: descricao || null,
    pessoaId: pessoaId || null,
    conteudo: conteudo || null,
    criadoEm: new Date().toISOString()
  };

  documentos.push(novoDoc);
  salvarArquivo(ARQUIVO, documentos);
  responder(res, 201, novoDoc);
}

function atualizarDocumento(req, res, id, body) {
  const documentos = lerArquivo(ARQUIVO);
  const index = documentos.findIndex(d => d.id === id);
  if (index === -1) return responder(res, 404, { erro: 'Documento não encontrado' });

  const { titulo, tipo, descricao, pessoaId, conteudo } = body;

  if (pessoaId) {
    const pessoas = lerArquivo(ARQUIVO_PESSOAS);
    const pessoa = pessoas.find(p => p.id === pessoaId);
    if (!pessoa) return responder(res, 404, { erro: 'Pessoa não encontrada para vincular' });
  }

  documentos[index] = {
    ...documentos[index],
    titulo: titulo || documentos[index].titulo,
    tipo: tipo || documentos[index].tipo,
    descricao: descricao !== undefined ? descricao : documentos[index].descricao,
    pessoaId: pessoaId !== undefined ? pessoaId : documentos[index].pessoaId,
    conteudo: conteudo !== undefined ? conteudo : documentos[index].conteudo,
    atualizadoEm: new Date().toISOString()
  };

  salvarArquivo(ARQUIVO, documentos);
  responder(res, 200, documentos[index]);
}

function deletarDocumento(req, res, id) {
  const documentos = lerArquivo(ARQUIVO);
  const index = documentos.findIndex(d => d.id === id);
  if (index === -1) return responder(res, 404, { erro: 'Documento não encontrado' });

  const removido = documentos.splice(index, 1)[0];
  salvarArquivo(ARQUIVO, documentos);
  responder(res, 200, { mensagem: 'Documento removido com sucesso', documento: removido });
}

function responder(res, status, dados) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(dados));
}

module.exports = {
  listarDocumentos,
  buscarDocumento,
  listarDocumentosDaPessoa,
  criarDocumento,
  atualizarDocumento,
  deletarDocumento
};
