const { lerArquivo, salvarArquivo, gerarId } = require('../utils/storage');

const ARQUIVO = 'pessoas.json';

function listarPessoas(req, res) {
  const pessoas = lerArquivo(ARQUIVO);
  responder(res, 200, pessoas);
}

function buscarPessoa(req, res, id) {
  const pessoas = lerArquivo(ARQUIVO);
  const pessoa = pessoas.find(p => p.id === id);
  if (!pessoa) return responder(res, 404, { erro: 'Pessoa não encontrada' });
  responder(res, 200, pessoa);
}

function criarPessoa(req, res, body) {
  const { nome, cpf, email, telefone, dataNascimento } = body;
  if (!nome || !cpf) return responder(res, 400, { erro: 'Nome e CPF são obrigatórios' });

  const pessoas = lerArquivo(ARQUIVO);
  const jaExiste = pessoas.find(p => p.cpf === cpf);
  if (jaExiste) return responder(res, 409, { erro: 'CPF já cadastrado' });

  const novaPessoa = {
    id: gerarId(pessoas),
    nome,
    cpf,
    email: email || null,
    telefone: telefone || null,
    dataNascimento: dataNascimento || null,
    criadoEm: new Date().toISOString()
  };

  pessoas.push(novaPessoa);
  salvarArquivo(ARQUIVO, pessoas);
  responder(res, 201, novaPessoa);
}

function atualizarPessoa(req, res, id, body) {
  const pessoas = lerArquivo(ARQUIVO);
  const index = pessoas.findIndex(p => p.id === id);
  if (index === -1) return responder(res, 404, { erro: 'Pessoa não encontrada' });

  const { nome, cpf, email, telefone, dataNascimento } = body;
  if (cpf && cpf !== pessoas[index].cpf) {
    const jaExiste = pessoas.find(p => p.cpf === cpf);
    if (jaExiste) return responder(res, 409, { erro: 'CPF já cadastrado para outra pessoa' });
  }

  pessoas[index] = {
    ...pessoas[index],
    nome: nome || pessoas[index].nome,
    cpf: cpf || pessoas[index].cpf,
    email: email !== undefined ? email : pessoas[index].email,
    telefone: telefone !== undefined ? telefone : pessoas[index].telefone,
    dataNascimento: dataNascimento !== undefined ? dataNascimento : pessoas[index].dataNascimento,
    atualizadoEm: new Date().toISOString()
  };

  salvarArquivo(ARQUIVO, pessoas);
  responder(res, 200, pessoas[index]);
}

function deletarPessoa(req, res, id) {
  const pessoas = lerArquivo(ARQUIVO);
  const index = pessoas.findIndex(p => p.id === id);
  if (index === -1) return responder(res, 404, { erro: 'Pessoa não encontrada' });

  const removida = pessoas.splice(index, 1)[0];
  salvarArquivo(ARQUIVO, pessoas);
  responder(res, 200, { mensagem: 'Pessoa removida com sucesso', pessoa: removida });
}

function responder(res, status, dados) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(dados));
}

module.exports = { listarPessoas, buscarPessoa, criarPessoa, atualizarPessoa, deletarPessoa };
