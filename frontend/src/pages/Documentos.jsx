import { useState, useEffect } from 'react';
import { api } from '../api.js';

const TIPOS = ['Contrato', 'Ofício', 'Certidão', 'Relatório', 'Requerimento', 'Portaria', 'Decreto', 'Outros'];

const FORM_VAZIO = { titulo: '', tipo: '', descricao: '', pessoaId: '', conteudo: '' };

export default function Documentos() {
  const [lista, setLista]             = useState([]);
  const [pessoas, setPessoas]         = useState([]);
  const [form, setForm]               = useState(FORM_VAZIO);
  const [editandoId, setEditandoId]   = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro]               = useState('');
  const [msg, setMsg]                 = useState('');
  const [carregando, setCarregando]   = useState(true);
  const [enviando, setEnviando]       = useState(false);

  useEffect(() => {
    listar();
    api.getPessoas().then(setPessoas).catch(() => {});
  }, []);

  async function listar() {
    setCarregando(true);
    try {
      setLista(await api.getDocumentos());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(''); setMsg(''); setEnviando(true);
    try {
      const payload = {
        ...form,
        pessoaId: form.pessoaId ? parseInt(form.pessoaId) : null,
      };
      if (editandoId) {
        await api.atualizarDocumento(editandoId, payload);
        setMsg('Documento atualizado com sucesso.');
      } else {
        await api.criarDocumento(payload);
        setMsg('Documento cadastrado com sucesso.');
      }
      cancelar();
      listar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  function handleEditar(d) {
    setForm({
      titulo:    d.titulo,
      tipo:      d.tipo,
      descricao: d.descricao || '',
      pessoaId:  d.pessoaId  ? String(d.pessoaId) : '',
      conteudo:  d.conteudo  || '',
    });
    setEditandoId(d.id);
    setMostrarForm(true);
    setErro(''); setMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDeletar(id, titulo) {
    if (!confirm(`Confirma a exclusão do documento "${titulo}"?\nEsta ação não pode ser desfeita.`)) return;
    setErro(''); setMsg('');
    try {
      await api.deletarDocumento(id);
      setMsg('Documento removido com sucesso.');
      listar();
    } catch (e) {
      setErro(e.message);
    }
  }

  function cancelar() {
    setMostrarForm(false);
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setErro('');
  }

  function abrirNovo() {
    cancelar();
    setMostrarForm(true);
  }

  function nomePessoa(id) {
    if (!id) return <span style={{ color: '#999' }}>—</span>;
    const p = pessoas.find(p => p.id === id);
    return p ? p.nome : `ID ${id}`;
  }

  return (
    <div className="container">
      {/* Cabeçalho */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestão de Documentos</h1>
          <p className="page-subtitle">
            Cadastro, consulta e administração de documentos
          </p>
        </div>
        {!mostrarForm && (
          <button className="btn btn-primary" onClick={abrirNovo}>
            + Novo Documento
          </button>
        )}
      </div>

      {msg  && <div className="alerta alerta-sucesso">{msg}</div>}
      {erro && <div className="alerta alerta-erro">{erro}</div>}

      {/* Formulário */}
      {mostrarForm && (
        <div className="card">
          <h2 className="card-title">
            {editandoId ? '✏️ Editar Documento' : '➕ Cadastrar Novo Documento'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="titulo">Título *</label>
                <input
                  id="titulo" name="titulo"
                  value={form.titulo} onChange={handleChange}
                  required placeholder="Título do documento"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="tipo">Tipo *</label>
                <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange} required>
                  <option value="">— Selecione o tipo —</option>
                  {TIPOS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="pessoaId">Vincular à Pessoa</label>
                <select id="pessoaId" name="pessoaId" value={form.pessoaId} onChange={handleChange}>
                  <option value="">— Nenhuma —</option>
                  {pessoas.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} — {p.cpf}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="descricao">Descrição</label>
                <input
                  id="descricao" name="descricao"
                  value={form.descricao} onChange={handleChange}
                  placeholder="Breve descrição do documento"
                />
              </div>
              <div className="form-group full">
                <label htmlFor="conteudo">Conteúdo / Observações</label>
                <textarea
                  id="conteudo" name="conteudo"
                  value={form.conteudo} onChange={handleChange}
                  placeholder="Texto completo ou observações sobre o documento..."
                  rows={4}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={enviando}>
                {enviando ? <span className="spinner" /> : null}
                {editandoId ? 'Salvar Alterações' : 'Cadastrar Documento'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancelar}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela */}
      <div className="card">
        <h2 className="card-title">
          Documentos Cadastrados
          {!carregando && (
            <span className="badge registro-badge">
              {lista.length} registro{lista.length !== 1 ? 's' : ''}
            </span>
          )}
        </h2>

        {carregando ? (
          <p className="vazio">
            <span className="spinner dark" /> &nbsp;Carregando...
          </p>
        ) : lista.length === 0 ? (
          <p className="vazio">Nenhum documento cadastrado. Clique em "+ Novo Documento" para começar.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Pessoa Vinculada</th>
                  <th>Cadastrado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(d => (
                  <tr key={d.id}>
                    <td><span className="badge">{d.id}</span></td>
                    <td><strong>{d.titulo}</strong></td>
                    <td>
                      <span className="badge badge-tipo">
                        {d.tipo}
                      </span>
                    </td>
                    <td>{d.descricao || <span className="muted">—</span>}</td>
                    <td>{nomePessoa(d.pessoaId)}</td>
                    <td>
                      {d.criadoEm
                        ? new Date(d.criadoEm).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                    <td>
                      <div className="td-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEditar(d)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeletar(d.id, d.titulo)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <footer className="rodape">
        WPAH &copy; {new Date().getFullYear()} — Gestão de Pessoas e Documentos
      </footer>
    </div>
  );
}
