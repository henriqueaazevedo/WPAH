import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import Modal from '../components/Modal.jsx';
import LoadingBlock from '../components/LoadingBlock.jsx';
import Pagination from '../components/Pagination.jsx';
import toast from 'react-hot-toast';
import { 
  FilePlus, 
  Search, 
  Trash2, 
  Edit3, 
  Eye as EyeIcon, 
  FileText,
  Filter
} from 'lucide-react';

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
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || '{}');
  const userRole = String(usuarioLogado.role || '').toLowerCase();
  const userLogin = String(usuarioLogado.login || '').toLowerCase();
  // REGRA SUPREMA: Acesso total apenas para 'super'.
  const isSuper = userLogin === 'super' || userRole === 'super';
  const isAdmin = isSuper || userRole === 'admin' || userLogin === 'admin';

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
      toast.error('Erro ao carregar dados: ' + e.message);
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
      toast.error('Erro ao listar documentos: ' + e.message);
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
    const toastId = toast.loading(editandoId ? 'Atualizando...' : 'Cadastrando...');

    try {
      const payload = {
        ...form,
        pessoaId: form.pessoaId ? parseInt(form.pessoaId, 10) : null
      };
      if (editandoId) {
        await api.atualizarDocumento(editandoId, payload);
        toast.success('Documento atualizado com sucesso.', { id: toastId });
      } else {
        await api.criarDocumento(payload);
        toast.success('Documento cadastrado com sucesso.', { id: toastId });
      }
      setForm(FORM_VAZIO);
      setEditandoId(null);
      setMostrarForm(false);
      setModalEdicaoAberto(false);
      listar();
    } catch (e) {
      toast.error(e.message, { id: toastId });
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
    const toastId = toast.loading('Excluindo...');
    try {
      await api.deletarDocumento(modalExclusaoDocumento.id);
      toast.success('Documento removido com sucesso.', { id: toastId });
      setModalExclusaoDocumento(null);
      listar();
    } catch (e) {
      toast.error(e.message, { id: toastId });
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
        {!mostrarForm && isAdmin && (
          <button className="btn btn-primary" onClick={() => setMostrarForm(true)}>
            <FilePlus size={18} /> Novo Documento
          </button>
        )}
      </div>

      <div className="card">
        <h2 className="card-title"><Filter size={18} style={{verticalAlign: 'middle', marginRight: '8px'}} /> Filtros de busca</h2>
        <form className="filter-bar" onSubmit={aplicarFiltros}>
          <input name="q" value={filtros.q} onChange={handleFiltroChange} placeholder="Buscar por título, tipo, descrição ou conteúdo" />
          <input name="startDate" type="date" value={filtros.startDate} onChange={handleFiltroChange} />
          <input name="endDate" type="date" value={filtros.endDate} onChange={handleFiltroChange} />
          <button className="btn btn-primary" type="submit"><Search size={16} /> Filtrar</button>
          <button className="btn btn-secondary" type="button" onClick={limparFiltros}>Limpar</button>
        </form>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO UNIFICADO */}
      <Modal aberto={mostrarForm || modalEdicaoAberto} titulo={editandoId ? 'Editar Documento' : 'Cadastrar Novo Documento'} onClose={() => { setMostrarForm(false); setModalEdicaoAberto(false); setEditandoId(null); setForm(FORM_VAZIO); }}>
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
                <select name="pessoaId" value={form.pessoaId} onChange={handleChange} style={{paddingRight: '2rem'}}>
                  <option value="">Nenhuma</option>
                  {pessoas.map(pessoa => <option key={pessoa.id} value={pessoa.id}>{pessoa.nome}</option>)}
                </select>
              </div>
              <div className="form-group" style={{gridColumn: '1 / -1'}}>
                <label>Descrição</label>
                <input name="descricao" value={form.descricao} onChange={handleChange} />
              </div>
              <div className="form-group" style={{gridColumn: '1 / -1'}}>
                <label>Conteúdo</label>
                <textarea name="conteudo" value={form.conteudo} onChange={handleChange} rows={5} />
              </div>
            </div>
            <div className="form-actions" style={{justifyContent: 'flex-end', marginTop: '1.5rem'}}>
              <button className="btn btn-secondary" type="button" onClick={() => { setMostrarForm(false); setModalEdicaoAberto(false); setEditandoId(null); setForm(FORM_VAZIO); }}>Cancelar</button>
              <button className="btn btn-primary" type="submit" disabled={enviando}>
                {enviando ? <span className="spinner" /> : null}
                {editandoId ? 'Salvar Alterações' : 'Cadastrar Documento'}
              </button>
            </div>
          </form>
      </Modal>

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
                        <button className="btn btn-secondary btn-sm btn-icon" title="Ver" onClick={() => setSelecionado(documento)}><EyeIcon size={16} /></button>
                        {(isAdmin || isSuper) && (
                          <>
                            <button className="btn btn-secondary btn-sm btn-icon" title="Editar" onClick={() => editar(documento)}><Edit3 size={16} /></button>
                            <button className="btn btn-danger btn-sm btn-icon" title="Excluir" onClick={() => setModalExclusaoDocumento(documento)}><Trash2 size={16} /></button>
                          </>
                        )}
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

      <Modal aberto={!!selecionado} titulo="Visualizar Documento" onClose={() => setSelecionado(null)}>
        {selecionado && (
          <div className="detail-grid">
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '4px'}}>
               <FileText size={40} color="#164b80" />
               <div>
                  <h3 style={{margin: 0}}>{selecionado.titulo}</h3>
                  <span className="badge badge-tipo">{selecionado.tipo}</span>
               </div>
            </div>
            <p><strong>Pessoa vinculada:</strong> {nomePessoa(selecionado.pessoaId)}</p>
            <p><strong>Descrição:</strong> {selecionado.descricao || '—'}</p>
            {(isAdmin || isSuper) && (
              <div style={{marginTop: '1.5rem', display: 'flex', gap: '1rem'}}>
                <button className="btn btn-primary" onClick={() => { editar(selecionado); setSelecionado(null); }}>
                  <Edit3 size={16} /> Editar este Documento
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>


      <Modal aberto={!!modalExclusaoDocumento} titulo="Confirmar Exclusão" onClose={() => setModalExclusaoDocumento(null)}>
        {modalExclusaoDocumento && (
          <div className="detail-grid">
            <p>Você tem certeza que deseja excluir o documento <strong>{modalExclusaoDocumento.titulo}</strong>?</p>
            <div className="form-actions" style={{justifyContent: 'flex-end', marginTop: '1rem'}}>
              <button className="btn btn-secondary" type="button" onClick={() => setModalExclusaoDocumento(null)}>Cancelar</button>
              <button className="btn btn-danger" type="button" onClick={confirmarExclusao}>Excluir Documento</button>
            </div>
          </div>
        )}
      </Modal>

      <footer className="rodape">WPAH © {new Date().getFullYear()} — Secretaria Digital</footer>
    </div>
  );
}
