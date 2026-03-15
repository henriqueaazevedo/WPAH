const { lerArquivo, salvarArquivo, gerarId } = require('../utils/storage');
const { correspondeBusca, dentroDoPeriodo } = require('../utils/filtros');
const auth = require('./auth');

const ARQUIVO = 'pessoas.json';
const ARQUIVO_DOCUMENTOS = 'documentos.json';
const ARQUIVO_PROTOCOLOS = 'protocolos.json';

function obterQuery(req) {
  return new URL(req.url, 'http://localhost').searchParams;
}

function listarPessoas(req, res) {
  const query = obterQuery(req);
  const termo = query.get('q') || '';
  const dataInicio = query.get('startDate') || '';
  const dataFim = query.get('endDate') || '';

  const pessoas = lerArquivo(ARQUIVO).filter(pessoa => {
    return correspondeBusca(pessoa, termo, ['nome', 'cpf', 'email', 'telefone'])
      && dentroDoPeriodo(pessoa, ['dataNascimento', 'criadoEm'], dataInicio, dataFim);
  });

  responder(res, 200, pessoas);
}

function buscarPessoa(req, res, id) {
  const pessoas = lerArquivo(ARQUIVO);
  const pessoa = pessoas.find(p => p.id === id);
  if (!pessoa) return responder(res, 404, { erro: 'Pessoa não encontrada' });
  responder(res, 200, pessoa);
}

function criarPessoa(req, res, body) {
  const { nome, cpf, email, telefone, dataNascimento, senha } = body;
  if (!nome || !cpf) return responder(res, 400, { erro: 'Nome e CPF são obrigatórios' });

  const pessoas = lerArquivo(ARQUIVO);
  const jaExiste = pessoas.find(p => String(p.cpf).replace(/\D/g, '') === String(cpf).replace(/\D/g, ''));
  if (jaExiste) return responder(res, 409, { erro: 'CPF já cadastrado' });

  const novaPessoa = {
    id: gerarId(pessoas),
    nome,
    cpf,
    email: email || null,
    telefone: telefone || null,
    dataNascimento: dataNascimento || null,
    criadoEm: new Date().toISOString(),
    origemCadastro: 'interno'
  };

  pessoas.push(novaPessoa);
  salvarArquivo(ARQUIVO, pessoas);

  try {
    const { usuario, credenciais } = auth.criarUsuarioParaPessoa({
      nome,
      email,
      cpf,
      pessoaId: novaPessoa.id,
      senha,
      origem: 'cadastro-interno'
    });

    responder(res, 201, {
      ...novaPessoa,
      acesso: credenciais,
      usuario: auth.sanitizarUsuario(usuario)
    });
  } catch (erro) {
    salvarArquivo(ARQUIVO, pessoas.filter(pessoa => pessoa.id !== novaPessoa.id));
    responder(res, 409, { erro: erro.message });
  }
}

function atualizarPessoa(req, res, id, body) {
  const pessoas = lerArquivo(ARQUIVO);
  const index = pessoas.findIndex(p => p.id === id);
  if (index === -1) return responder(res, 404, { erro: 'Pessoa não encontrada' });

  const { nome, cpf, email, telefone, dataNascimento } = body;
  if (cpf && String(cpf).replace(/\D/g, '') !== String(pessoas[index].cpf).replace(/\D/g, '')) {
    const jaExiste = pessoas.find(p => String(p.cpf).replace(/\D/g, '') === String(cpf).replace(/\D/g, ''));
    if (jaExiste) return responder(res, 409, { erro: 'CPF já cadastrado para outra pessoa' });
  }

  pessoas[index] = {
    ...pessoas[index],
    nome: nome || pessoas[index].nome,
    cpf: cpf || pessoas[index].cpf,
    email: email !== undefined ? (email || null) : pessoas[index].email,
    telefone: telefone !== undefined ? telefone : pessoas[index].telefone,
    dataNascimento: dataNascimento !== undefined ? dataNascimento : pessoas[index].dataNascimento,
    atualizadoEm: new Date().toISOString()
  };

  try {
    auth.atualizarUsuarioDaPessoa({
      pessoaId: id,
      nome: pessoas[index].nome,
      email: pessoas[index].email
    });
  } catch (erro) {
    return responder(res, 409, { erro: erro.message });
  }

  salvarArquivo(ARQUIVO, pessoas);
  responder(res, 200, pessoas[index]);
}

function deletarPessoa(req, res, id) {
  const pessoas = lerArquivo(ARQUIVO);
  const index = pessoas.findIndex(p => p.id === id);
  if (index === -1) return responder(res, 404, { erro: 'Pessoa não encontrada' });

  const removida = pessoas.splice(index, 1)[0];
  salvarArquivo(ARQUIVO, pessoas);

  auth.removerUsuarioDaPessoa(id);

  const documentos = lerArquivo(ARQUIVO_DOCUMENTOS).map(documento => {
    if (documento.pessoaId !== id) return documento;
    return { ...documento, pessoaId: null, atualizadoEm: new Date().toISOString() };
  });
  salvarArquivo(ARQUIVO_DOCUMENTOS, documentos);

  const protocolos = lerArquivo(ARQUIVO_PROTOCOLOS).map(protocolo => {
    if (protocolo.pessoaId !== id) return protocolo;
    return { ...protocolo, pessoaId: null, atualizadoEm: new Date().toISOString() };
  });
  salvarArquivo(ARQUIVO_PROTOCOLOS, protocolos);

  responder(res, 200, { mensagem: 'Pessoa removida com sucesso', pessoa: removida });
}

function responder(res, status, dados) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(dados));
}

module.exports = { listarPessoas, buscarPessoa, criarPessoa, atualizarPessoa, deletarPessoa };
