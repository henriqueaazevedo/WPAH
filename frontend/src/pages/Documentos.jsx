import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import Modal from '../components/Modal.jsx';
import LoadingBlock from '../components/LoadingBlock.jsx';
import Pagination from '../components/Pagination.jsx';

const TIPOS = ['Lei', 'Contrato', 'Ofício', 'Certidão', 'Relatório', 'Portaria', 'Decreto', 'Outros'];
const FORM_VAZIO = { titulo: '', tipo: '', descricao: '', pessoaId: '', conteudo: '' };

export default function Documentos() {
  const PAGE_SIZE = 8;
  const [lista, setLista] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [filtros, setFiltros] = useState({ q: '', startDate: '', endDate: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [modalExclusaoDocumento, setModalExclusaoDocumento] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const listaPaginada = useMemo(() => {
    const inicio = (paginaAtual - 1) * PAGE_SIZE;
    return lista.slice(inicio, inicio + PAGE_SIZE);
  }, [lista, paginaAtual]);

  useEffect(() => {
    const totalPaginas = Math.max(1, Math.ceil(lista.length / PAGE_SIZE));
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [lista, paginaAtual]);

  useEffect(() => {
    carregarBase();
  }, []);

  async function carregarBase() {
    setCarregando(true);
    try {
      const [documentos, pessoasData] = await Promise.all([
        api.getDocumentos(),
        api.getPessoas()
      ]);
      setLista(documentos);
      setPessoas(pessoasData);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  async function listar(params = filtros) {
    setCarregando(true);
    try {
      setLista(await api.getDocumentos(params));
      setPaginaAtual(1);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFiltroChange(e) {
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function aplicarFiltros(e) {
    e.preventDefault();
    listar(filtros);
  }

  function limparFiltros() {
    const novos = { q: '', startDate: '', endDate: '' };
    setFiltros(novos);
    listar(novos);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setErro('');

    try {
      const payload = {
        ...form,
        pessoaId: form.pessoaId ? parseInt(form.pessoaId, 10) : null
      };
      if (editandoId) {
        await api.atualizarDocumento(editandoId, payload);
        setMsg('Documento atualizado com sucesso.');
      } else {
        await api.criarDocumento(payload);
        setMsg('Documento cadastrado com sucesso.');
      }
      setForm(FORM_VAZIO);
      setEditandoId(null);
      setMostrarForm(false);
      setModalEdicaoAberto(false);
      listar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  function editar(documento) {
    setForm({
      titulo: documento.titulo,
      tipo: documento.tipo,
      descricao: documento.descricao || '',
      pessoaId: documento.pessoaId ? String(documento.pessoaId) : '',
      conteudo: documento.conteudo || ''
    });
    setEditandoId(documento.id);
    setModalEdicaoAberto(true);
  }

  async function confirmarExclusao() {
    if (!modalExclusaoDocumento) return;
    try {
      await api.deletarDocumento(modalExclusaoDocumento.id);
      setMsg('Documento removido com sucesso.');
      setModalExclusaoDocumento(null);
      listar();
    } catch (e) {
      setErro(e.message);
    }
  }

  function nomePessoa(id) {
    if (!id) return '—';
    const pessoa = pessoas.find(item => item.id === id);
    return pessoa ? pessoa.nome : `Pessoa #${id}`;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leis e Documentos</h1>
          <p className="page-subtitle">Documentos administrativos com busca por período e conteúdo.</p>
        </div>
        {!mostrarForm && <button className="btn btn-primary" onClick={() => setMostrarForm(true)}>+ Novo Documento</button>}
      </div>

      {msg && <div className="alerta alerta-sucesso">{msg}</div>}
      {erro && <div className="alerta alerta-erro">{erro}</div>}

      <div className="card">
        <h2 className="card-title">Filtros da sessão</h2>
        <form className="filter-bar" onSubmit={aplicarFiltros}>
          <input name="q" value={filtros.q} onChange={handleFiltroChange} placeholder="Buscar por título, tipo, descrição ou conteúdo" />
          <input name="startDate" type="date" value={filtros.startDate} onChange={handleFiltroChange} />
          <input name="endDate" type="date" value={filtros.endDate} onChange={handleFiltroChange} />
          <button className="btn btn-primary" type="submit">Filtrar</button>
          <button className="btn btn-secondary" type="button" onClick={limparFiltros}>Limpar</button>
        </form>
      </div>

      {mostrarForm && (
        <div className="card">
          <h2 className="card-title">{editandoId ? 'Editar documento' : 'Cadastrar novo documento'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Título *</label>
                <input name="titulo" value={form.titulo} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Tipo *</label>
                <select name="tipo" value={form.tipo} onChange={handleChange} required>
                  <option value="">Selecione</option>
                  {TIPOS.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Pessoa vinculada</label>
                <select name="pessoaId" value={form.pessoaId} onChange={handleChange}>
                  <option value="">Nenhuma</option>
                  {pessoas.map(pessoa => <option key={pessoa.id} value={pessoa.id}>{pessoa.nome}</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label>Descrição</label>
                <input name="descricao" value={form.descricao} onChange={handleChange} />
              </div>
              <div className="form-group full">
                <label>Conteúdo</label>
                <textarea name="conteudo" value={form.conteudo} onChange={handleChange} rows={6} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={enviando}>{enviando ? <span className="spinner" /> : null}{editandoId ? 'Salvar alterações' : 'Cadastrar documento'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => { setMostrarForm(false); setEditandoId(null); setForm(FORM_VAZIO); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Documentos cadastrados {!carregando && <span className="badge registro-badge">{lista.length} registros</span>}</h2>
        {carregando ? (
          <LoadingBlock texto="Carregando documentos..." />
        ) : lista.length === 0 ? (
          <p className="vazio">Nenhum documento encontrado.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Pessoa</th>
                  <th>Descrição</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaPaginada.map(documento => (
                  <tr key={documento.id}>
                    <td><span className="badge">{documento.id}</span></td>
                    <td><strong>{documento.titulo}</strong></td>
                    <td><span className="badge badge-tipo">{documento.tipo}</span></td>
                    <td>{nomePessoa(documento.pessoaId)}</td>
                    <td>{documento.descricao || <span className="muted">—</span>}</td>
                    <td>{documento.criadoEm ? new Date(documento.criadoEm).toLocaleDateString('pt-BR') : '—'}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-secondary btn-sm btn-icon" title="Ver" onClick={() => setSelecionado(documento)}>◉</button>
                        <button className="btn btn-secondary btn-sm btn-icon" title="Editar" onClick={() => editar(documento)}>✎</button>
                        <button className="btn btn-danger btn-sm btn-icon" title="Excluir" onClick={() => setModalExclusaoDocumento(documento)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={paginaAtual}
              totalItems={lista.length}
              pageSize={PAGE_SIZE}
              onChange={setPaginaAtual}
            />
          </div>
        )}
      </div>

      <Modal aberto={!!selecionado} titulo="Conteúdo do documento" onClose={() => setSelecionado(null)}>
        {selecionado && (
          <div className="detail-grid">
            <p><strong>Título:</strong> {selecionado.titulo}</p>
            <p><strong>Tipo:</strong> {selecionado.tipo}</p>
            <p><strong>Pessoa vinculada:</strong> {nomePessoa(selecionado.pessoaId)}</p>
            <p><strong>Descrição:</strong> {selecionado.descricao || '—'}</p>
            <div className="detail-text-block">
              <strong>Conteúdo</strong>
              <p>{selecionado.conteudo || 'Sem conteúdo registrado.'}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal aberto={modalEdicaoAberto} titulo="Editar documento" onClose={() => { setModalEdicaoAberto(false); setEditandoId(null); setForm(FORM_VAZIO); }}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Título *</label>
              <input name="titulo" value={form.titulo} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Tipo *</label>
              <select name="tipo" value={form.tipo} onChange={handleChange} required>
                <option value="">Selecione</option>
                {TIPOS.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Pessoa vinculada</label>
              <select name="pessoaId" value={form.pessoaId} onChange={handleChange}>
                <option value="">Nenhuma</option>
                {pessoas.map(pessoa => <option key={pessoa.id} value={pessoa.id}>{pessoa.nome}</option>)}
              </select>
            </div>
            <div className="form-group full">
              <label>Descrição</label>
              <input name="descricao" value={form.descricao} onChange={handleChange} />
            </div>
            <div className="form-group full">
              <label>Conteúdo</label>
              <textarea name="conteudo" value={form.conteudo} onChange={handleChange} rows={6} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={enviando}>{enviando ? <span className="spinner" /> : null}Salvar alterações</button>
            <button className="btn btn-secondary" type="button" onClick={() => { setModalEdicaoAberto(false); setEditandoId(null); setForm(FORM_VAZIO); }}>Cancelar</button>
          </div>
        </form>
      </Modal>

      <Modal aberto={!!modalExclusaoDocumento} titulo="Confirmar exclusão" onClose={() => setModalExclusaoDocumento(null)}>
        {modalExclusaoDocumento && (
          <div className="detail-grid">
            <p>Confirma excluir <strong>{modalExclusaoDocumento.titulo}</strong>?</p>
            <div className="form-actions">
              <button className="btn btn-danger" type="button" onClick={confirmarExclusao}>Excluir</button>
              <button className="btn btn-secondary" type="button" onClick={() => setModalExclusaoDocumento(null)}>Cancelar</button>
            </div>
          </div>
        )}
      </Modal>

      <footer className="rodape">WPAH © {new Date().getFullYear()} — Leis e Documentos</footer>
    </div>
  );
}
