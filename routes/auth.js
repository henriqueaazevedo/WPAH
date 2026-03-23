const { lerColecao, salvarColecao, gerarId } = require('../utils/mongoStorage');

const ARQUIVO_USUARIOS = 'usuarios.json';
const ARQUIVO_PESSOAS = 'pessoas.json';

function normalizarTexto(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function apenasDigitos(valor) {
  return String(valor || '').replace(/\D/g, '');
}

async function lerUsuarios() {
  return lerColecao('usuarios');
}

async function salvarUsuarios(usuarios) {
  await salvarColecao('usuarios', usuarios);
}

async function lerPessoas() {
  return lerColecao('pessoas');
}

async function salvarPessoas(pessoas) {
  await salvarColecao('pessoas', pessoas);
}

function sanitizarUsuario(usuario) {
  const { senha, ...usuarioSemSenha } = usuario;
  return usuarioSemSenha;
}

function gerarLoginDisponivel(usuarios, nome, cpf) {
  const baseNome = normalizarTexto(nome)
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join('.');
  const sufixoCpf = apenasDigitos(cpf).slice(-4) || '0001';
  const base = (baseNome || 'usuario') + sufixoCpf;
  let login = base;
  let contador = 1;

  while (usuarios.some(usuario => usuario.login === login)) {
    contador += 1;
    login = `${base}${contador}`;
  }

  return login;
}

function validarEmailUnico(usuarios, email, usuarioIdIgnorado) {
  if (!email) return;
  const emailNormalizado = normalizarTexto(email);
  const jaExiste = usuarios.find(usuario => normalizarTexto(usuario.email) === emailNormalizado && usuario.id !== usuarioIdIgnorado);
  if (jaExiste) {
    throw new Error('Email já cadastrado');
  }
}

async function criarUsuarioParaPessoa({ nome, email, cpf, pessoaId, senha, origem }) {
  const usuarios = await lerUsuarios();
  validarEmailUnico(usuarios, email);

  const login = gerarLoginDisponivel(usuarios, nome, cpf);
  const senhaProvisoria = senha || apenasDigitos(cpf).slice(-6) || '123456';

  const novoUsuario = {
    id: gerarId(usuarios),
    pessoaId,
    nome,
    email: email || null,
    login,
    senha: senhaProvisoria,
    origem: origem || 'cadastro-pessoa',
    criadoEm: new Date().toISOString()
  };

  usuarios.push(novoUsuario);
  await salvarUsuarios(usuarios);

  return {
    usuario: novoUsuario,
    credenciais: {
      login: novoUsuario.login,
      senha: senhaProvisoria
    }
  };
}

async function atualizarUsuarioDaPessoa({ pessoaId, nome, email }) {
  const usuarios = await lerUsuarios();
  const index = usuarios.findIndex(usuario => usuario.pessoaId === pessoaId);
  if (index === -1) return null;

  validarEmailUnico(usuarios, email, usuarios[index].id);

  usuarios[index] = {
    ...usuarios[index],
    nome: nome || usuarios[index].nome,
    email: email !== undefined ? (email || null) : usuarios[index].email,
    atualizadoEm: new Date().toISOString()
  };

  await salvarUsuarios(usuarios);
  return usuarios[index];
}

async function removerUsuarioDaPessoa(pessoaId) {
  const usuarios = await lerUsuarios();
  const index = usuarios.findIndex(usuario => usuario.pessoaId === pessoaId);
  if (index === -1) return null;

  const removido = usuarios.splice(index, 1)[0];
  await salvarUsuarios(usuarios);
  return removido;
}

async function cadastrar(req, res, body) {
  const { nome, email, cpf, senha, telefone, dataNascimento } = body;

  if (!nome || !email || !cpf || !senha) {
    return responder(res, 400, { erro: 'Nome, email, CPF e senha são obrigatórios' });
  }

  const pessoas = await lerPessoas();
  const cpfNormalizado = apenasDigitos(cpf);
  const pessoaExistente = pessoas.find(pessoa => apenasDigitos(pessoa.cpf) === cpfNormalizado);
  if (pessoaExistente) {
    return responder(res, 409, { erro: 'CPF já cadastrado' });
  }

  const novaPessoa = {
    id: gerarId(pessoas),
    nome,
    cpf,
    email,
    telefone: telefone || null,
    dataNascimento: dataNascimento || null,
    criadoEm: new Date().toISOString(),
    origemCadastro: 'autoatendimento'
  };

  pessoas.push(novaPessoa);
  await salvarPessoas(pessoas);

  try {
    const { usuario } = await criarUsuarioParaPessoa({
      nome,
      email,
      cpf,
      pessoaId: novaPessoa.id,
      senha,
      origem: 'autoatendimento'
    });

    return responder(res, 201, {
      mensagem: 'Usuário cadastrado com sucesso',
      usuario: sanitizarUsuario(usuario),
      pessoa: novaPessoa
    });
  } catch (erro) {
    const pessoasAtualizadas = (await lerPessoas()).filter(pessoa => pessoa.id !== novaPessoa.id);
    await salvarPessoas(pessoasAtualizadas);
    return responder(res, 409, { erro: erro.message });
  }
}

async function login(req, res, body) {
  const { acesso, email, login, senha } = body;
  const credencial = normalizarTexto(acesso || email || login);

  if (!credencial || !senha) {
    return responder(res, 400, { erro: 'Login e senha são obrigatórios' });
  }

  const usuarios = await lerUsuarios();
  const usuario = usuarios.find(item => {
    const emailAtual = normalizarTexto(item.email);
    const loginAtual = normalizarTexto(item.login);
    return (credencial === emailAtual || credencial === loginAtual) && item.senha === senha;
  });

  if (!usuario) {
    return responder(res, 401, { erro: 'Login ou senha inválidos' });
  }

  const pessoas = await lerPessoas();
  const pessoa = pessoas.find(item => item.id === usuario.pessoaId) || null;

  responder(res, 200, {
    mensagem: 'Login realizado com sucesso',
    usuario: {
      ...sanitizarUsuario(usuario),
      pessoa
    }
  });
}

async function listarUsuarios(req, res) {
  const usuarios = await lerUsuarios();
  responder(res, 200, usuarios.map(sanitizarUsuario));
}

async function buscarPerfil(req, res, usuarioId) {
  const usuarios = await lerUsuarios();
  const usuario = usuarios.find(item => item.id === usuarioId);
  if (!usuario) return responder(res, 404, { erro: 'Usuário não encontrado' });

  const pessoas = await lerPessoas();
  const pessoa = pessoas.find(item => item.id === usuario.pessoaId) || null;

  responder(res, 200, {
    usuario: sanitizarUsuario(usuario),
    pessoa
  });
}

async function atualizarPerfil(req, res, usuarioId, body) {
  const usuarios = await lerUsuarios();
  const usuarioIndex = usuarios.findIndex(item => item.id === usuarioId);
  if (usuarioIndex === -1) return responder(res, 404, { erro: 'Usuário não encontrado' });

  const pessoas = await lerPessoas();
  const pessoaIndex = pessoas.findIndex(item => item.id === usuarios[usuarioIndex].pessoaId);
  if (pessoaIndex === -1) return responder(res, 404, { erro: 'Pessoa vinculada não encontrada' });

  const { nome, email, telefone, dataNascimento, senha } = body;
  try {
    validarEmailUnico(usuarios, email, usuarios[usuarioIndex].id);
  } catch (erro) {
    return responder(res, 409, { erro: erro.message });
  }

  usuarios[usuarioIndex] = {
    ...usuarios[usuarioIndex],
    nome: nome || usuarios[usuarioIndex].nome,
    email: email !== undefined ? (email || null) : usuarios[usuarioIndex].email,
    senha: senha || usuarios[usuarioIndex].senha,
    atualizadoEm: new Date().toISOString()
  };

  pessoas[pessoaIndex] = {
    ...pessoas[pessoaIndex],
    nome: nome || pessoas[pessoaIndex].nome,
    email: email !== undefined ? (email || null) : pessoas[pessoaIndex].email,
    telefone: telefone !== undefined ? telefone : pessoas[pessoaIndex].telefone,
    dataNascimento: dataNascimento !== undefined ? dataNascimento : pessoas[pessoaIndex].dataNascimento,
    atualizadoEm: new Date().toISOString()
  };

  await salvarUsuarios(usuarios);
  await salvarPessoas(pessoas);

  responder(res, 200, {
    mensagem: 'Perfil atualizado com sucesso',
    usuario: sanitizarUsuario(usuarios[usuarioIndex]),
    pessoa: pessoas[pessoaIndex]
  });
}

function responder(res, status, dados) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(dados));
}

module.exports = {
  cadastrar,
  login,
  listarUsuarios,
  buscarPerfil,
  atualizarPerfil,
  criarUsuarioParaPessoa,
  atualizarUsuarioDaPessoa,
  removerUsuarioDaPessoa,
  sanitizarUsuario
};
