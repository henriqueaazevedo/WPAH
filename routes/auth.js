const { lerArquivo, salvarArquivo, gerarId } = require('../utils/storage');

const ARQUIVO = 'usuarios.json';

function cadastrar(req, res, body) {
  const { nome, email, senha } = body;

  if (!nome || !email || !senha) {
    return responder(res, 400, { erro: 'Nome, email e senha são obrigatórios' });
  }

  const usuarios = lerArquivo(ARQUIVO);
  const jaExiste = usuarios.find(u => u.email === email);
  if (jaExiste) {
    return responder(res, 409, { erro: 'Email já cadastrado' });
  }

  const novoUsuario = {
    id: gerarId(usuarios),
    nome,
    email,
    senha,
    criadoEm: new Date().toISOString()
  };

  usuarios.push(novoUsuario);
  salvarArquivo(ARQUIVO, usuarios);

  const { senha: _, ...usuarioSemSenha } = novoUsuario;
  responder(res, 201, { mensagem: 'Usuário cadastrado com sucesso', usuario: usuarioSemSenha });
}

function login(req, res, body) {
  const { email, senha } = body;

  if (!email || !senha) {
    return responder(res, 400, { erro: 'Email e senha são obrigatórios' });
  }

  const usuarios = lerArquivo(ARQUIVO);
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (!usuario) {
    return responder(res, 401, { erro: 'Email ou senha inválidos' });
  }

  const { senha: _, ...usuarioSemSenha } = usuario;
  responder(res, 200, { mensagem: 'Login realizado com sucesso', usuario: usuarioSemSenha });
}

function listarUsuarios(req, res) {
  const usuarios = lerArquivo(ARQUIVO);
  const semSenha = usuarios.map(({ senha, ...u }) => u);
  responder(res, 200, semSenha);
}

function responder(res, status, dados) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(dados));
}

module.exports = { cadastrar, login, listarUsuarios };
