function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function req(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);

  // Some endpoints may respond with an empty body (e.g. 204/empty error responses).
  const raw = await res.text();
  let data = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { erro: raw };
    }
  }

  if (!res.ok) throw new Error(data.erro || `Erro na requisição (${res.status})`);
  return data;
}

export const api = {
  login: (body) => req('POST', '/login', body),
  cadastro: (body) => req('POST', '/cadastro', body),

  getPessoas: (params) => req('GET', `/pessoas${buildQuery(params)}`),
  getPessoa: (id) => req('GET', `/pessoas/${id}`),
  criarPessoa: (body) => req('POST', '/pessoas', body),
  atualizarPessoa: (id, body) => req('PUT', `/pessoas/${id}`, body),
  deletarPessoa: (id) => req('DELETE', `/pessoas/${id}`),

  getDocumentos: (params) => req('GET', `/documentos${buildQuery(params)}`),
  getDocumento: (id) => req('GET', `/documentos/${id}`),
  criarDocumento: (body) => req('POST', '/documentos', body),
  atualizarDocumento: (id, body) => req('PUT', `/documentos/${id}`, body),
  deletarDocumento: (id) => req('DELETE', `/documentos/${id}`),

  getProtocolos: (params) => req('GET', `/protocolos${buildQuery(params)}`),
  getProtocolo: (id) => req('GET', `/protocolos/${id}`),
  criarProtocolo: (body) => req('POST', '/protocolos', body),
  atualizarProtocolo: (id, body) => req('PUT', `/protocolos/${id}`, body),
  deletarProtocolo: (id) => req('DELETE', `/protocolos/${id}`),

  buscar: (params) => req('GET', `/busca${buildQuery(params)}`),
  getServicos: () => req('GET', '/servicos'),
  getTransparencia: () => req('GET', '/transparencia'),
  getPerfil: (id) => req('GET', `/perfil/${id}`),
  atualizarPerfil: (id, body) => req('PUT', `/perfil/${id}`, body),
};
