async function req(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro na requisição');
  return data;
}

export const api = {
  login:             (body) => req('POST', '/login', body),
  cadastro:          (body) => req('POST', '/cadastro', body),

  getPessoas:        ()        => req('GET',    '/pessoas'),
  getPessoa:         (id)      => req('GET',    `/pessoas/${id}`),
  criarPessoa:       (body)    => req('POST',   '/pessoas', body),
  atualizarPessoa:   (id, b)   => req('PUT',    `/pessoas/${id}`, b),
  deletarPessoa:     (id)      => req('DELETE', `/pessoas/${id}`),

  getDocumentos:     ()        => req('GET',    '/documentos'),
  criarDocumento:    (body)    => req('POST',   '/documentos', body),
  atualizarDocumento:(id, b)   => req('PUT',    `/documentos/${id}`, b),
  deletarDocumento:  (id)      => req('DELETE', `/documentos/${id}`),
};
