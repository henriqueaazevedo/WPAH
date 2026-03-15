const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function lerArquivo(arquivo) {
  const caminho = path.join(DATA_DIR, arquivo);
  if (!fs.existsSync(caminho)) return [];
  const conteudo = fs.readFileSync(caminho, 'utf-8');
  return JSON.parse(conteudo);
}

function salvarArquivo(arquivo, dados) {
  const caminho = path.join(DATA_DIR, arquivo);
  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2), 'utf-8');
}

function gerarId(lista) {
  if (lista.length === 0) return 1;
  return Math.max(...lista.map(i => i.id)) + 1;
}

module.exports = { lerArquivo, salvarArquivo, gerarId };
