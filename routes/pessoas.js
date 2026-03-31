const { lerColecao, salvarColecao, gerarId } = require('../utils/mongoStorage');
const { correspondeBusca, dentroDoPeriodo } = require('../utils/filtros');
const auth = require('./auth');

const ARQUIVO = 'pessoas.json';
const ARQUIVO_DOCUMENTOS = 'documentos.json';
const ARQUIVO_PROTOCOLOS = 'protocolos.json';

function obterQuery(req) {
  return new URL(req.url, 'http://localhost').searchParams;
}

async function listarPessoas(req, res) {
  const query = obterQuery(req);
  const termo = query.get('q') || '';
  const dataInicio = query.get('startDate') || '';
  const dataFim = query.get('endDate') || '';

  const [pessoasRaw, usuarios] = await Promise.all([
    lerColecao('pessoas'),
    lerColecao('usuarios')
  ]);

  const pessoas = pessoasRaw
    .filter(pessoa => {
      return correspondeBusca(pessoa, termo, ['nome', 'cpf', 'email', 'telefone'])
        && dentroDoPeriodo(pessoa, ['dataNascimento', 'criadoEm'], dataInicio, dataFim);
    })
    .map(p => {
      const u = usuarios.find(user => user.pessoaId === p.id);
      return { 
        ...p, 
        usuario: u ? auth.sanitizarUsuario(u) : null,
        ultimoAcesso: u ? u.ultimoAcesso : null 
      };
    });

  responder(res, 200, pessoas);
}

async function buscarPessoa(req, res, id) {
  const pessoas = await lerColecao('pessoas');
  const pessoa = pessoas.find(p => p.id === id);
  if (!pessoa) return responder(res, 404, { erro: 'Pessoa não encontrada' });
  responder(res, 200, pessoa);
}

async function criarPessoa(req, res, body) {
  const { nome, cpf, email, telefone, dataNascimento, senha } = body;
  if (!nome || !cpf) return responder(res, 400, { erro: 'Nome e CPF são obrigatórios' });

  const pessoas = await lerColecao('pessoas');
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
  await salvarColecao('pessoas', pessoas);

  try {
    const { usuario, credenciais } = await auth.criarUsuarioParaPessoa({
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
    await salvarColecao('pessoas', pessoas.filter(pessoa => pessoa.id !== novaPessoa.id));
    responder(res, 409, { erro: erro.message });
  }
}

async function atualizarPessoa(req, res, id, body) {
  const pessoas = await lerColecao('pessoas');
  const index = pessoas.findIndex(p => p.id === id);
  if (index === -1) return responder(res, 404, { erro: 'Pessoa não encontrada' });

  const { nome, cpf, email, telefone, dataNascimento, statusSigiloso, obsSigilosa, role } = body;
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
    statusSigiloso: statusSigiloso !== undefined ? statusSigiloso : pessoas[index].statusSigiloso,
    obsSigilosa: obsSigilosa !== undefined ? obsSigilosa : pessoas[index].obsSigilosa,
    role: role !== undefined ? role : (pessoas[index].role || 'user'),
    atualizadoEm: new Date().toISOString()
  };

  try {
    await auth.atualizarUsuarioDaPessoa({
      pessoaId: id,
      nome: pessoas[index].nome,
      email: pessoas[index].email,
      role: pessoas[index].role
    });
  } catch (erro) {
    return responder(res, 409, { erro: erro.message });
  }

  await salvarColecao('pessoas', pessoas);
  responder(res, 200, pessoas[index]);
}

async function deletarPessoa(req, res, id) {
  const pessoas = await lerColecao('pessoas');
  const index = pessoas.findIndex(p => p.id === id);
  if (index === -1) return responder(res, 404, { erro: 'Pessoa não encontrada' });

  const removida = pessoas.splice(index, 1)[0];
  await salvarColecao('pessoas', pessoas);

  await auth.removerUsuarioDaPessoa(id);

  const documentos = (await lerColecao('documentos')).map(documento => {
    if (documento.pessoaId !== id) return documento;
    return { ...documento, pessoaId: null, atualizadoEm: new Date().toISOString() };
  });
  await salvarColecao('documentos', documentos);

  const protocolos = (await lerColecao('protocolos')).map(protocolo => {
    if (protocolo.pessoaId !== id) return protocolo;
    return { ...protocolo, pessoaId: null, atualizadoEm: new Date().toISOString() };
  });
  await salvarColecao('protocolos', protocolos);

  responder(res, 200, { mensagem: 'Pessoa removida com sucesso', pessoa: removida });
}

function responder(res, status, dados) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(dados));
}

module.exports = { listarPessoas, buscarPessoa, criarPessoa, atualizarPessoa, deletarPessoa };
