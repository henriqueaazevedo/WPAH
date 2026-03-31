import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import Modal from '../components/Modal.jsx';
import LoadingBlock from '../components/LoadingBlock.jsx';
import Pagination from '../components/Pagination.jsx';
import toast from 'react-hot-toast';
import { 
  ClipboardPlus, 
  Search, 
  Trash2, 
  Edit3, 
  Eye as EyeIcon, 
  ClipboardList,
  Filter,
  CheckCircle,
  Clock as ClockIcon
} from 'lucide-react';

const TIPOS = ['Atendimento', 'Solicitação', 'Requerimento', 'Denúncia', 'Processo'];
const SITUACOES = ['Em análise', 'Recebido', 'Pendente', 'Concluído', 'Arquivado'];
const FORM_VAZIO = {
  titulo: '',
  tipo: '',
  descricao: '',
  pessoaId: '',
  conteudo: '',
  situacao: 'Em análise',
  dataProtocolo: ''
};

export default function Protocolos() {
  const PAGE_SIZE = 8;
  const [lista, setLista] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [filtros, setFiltros] = useState({ q: '', startDate: '', endDate: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [modalExclusaoProtocolo, setModalExclusaoProtocolo] = useState(null);
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
      const [protocolos, pessoasData] = await Promise.all([
        api.getProtocolos(),
        api.getPessoas()
      ]);
      setLista(protocolos);
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
      setLista(await api.getProtocolos(params));
      setPaginaAtual(1);
    } catch (e) {
      toast.error('Erro ao listar protocolos: ' + e.message);
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
        await api.atualizarProtocolo(editandoId, payload);
        toast.success('Protocolo atualizado com sucesso.', { id: toastId });
      } else {
        await api.criarProtocolo(payload);
        toast.success('Protocolo cadastrado com sucesso.', { id: toastId });
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

  function editar(protocolo) {
    setForm({
      titulo: protocolo.titulo,
      tipo: protocolo.tipo,
      descricao: protocolo.descricao || '',
      pessoaId: protocolo.pessoaId ? String(protocolo.pessoaId) : '',
      conteudo: protocolo.conteudo || '',
      situacao: protocolo.situacao || 'Em análise',
      dataProtocolo: protocolo.dataProtocolo || ''
    });
    setEditandoId(protocolo.id);
    setModalEdicaoAberto(true);
  }

  async function confirmarExclusao() {
    if (!modalExclusaoProtocolo) return;
    const toastId = toast.loading('Excluindo...');
    try {
      await api.deletarProtocolo(modalExclusaoProtocolo.id);
      toast.success('Protocolo removido com sucesso.', { id: toastId });
      setModalExclusaoProtocolo(null);
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
          <h1 className="page-title">Protocolos</h1>
          <p className="page-subtitle">Controle completo de solicitações e tramitações.</p>
        </div>
        {!mostrarForm && isAdmin && (
          <button className="btn btn-primary" onClick={() => setMostrarForm(true)}>
            <ClipboardPlus size={18} /> Novo Protocolo
          </button>
        )}
      </div>

      <div className="card">
        <h2 className="card-title"><Filter size={18} style={{verticalAlign: 'middle', marginRight: '8px'}} /> Filtros de busca</h2>
        <form className="filter-bar" onSubmit={aplicarFiltros}>
          <input name="q" value={filtros.q} onChange={handleFiltroChange} placeholder="Buscar por número, título, tipo ou situação" />
          <input name="startDate" type="date" value={filtros.startDate} onChange={handleFiltroChange} />
          <input name="endDate" type="date" value={filtros.endDate} onChange={handleFiltroChange} />
          <button className="btn btn-primary" type="submit"><Search size={16} /> Filtrar</button>
          <button className="btn btn-secondary" type="button" onClick={limparFiltros}>Limpar</button>
        </form>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO UNIFICADO */}
      <Modal aberto={mostrarForm || modalEdicaoAberto} titulo={editandoId ? 'Editar Protocolo' : 'Cadastrar Novo Protocolo'} onClose={() => { setMostrarForm(false); setModalEdicaoAberto(false); setEditandoId(null); setForm(FORM_VAZIO); }}>
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
                <label>Situação</label>
                <select name="situacao" value={form.situacao} onChange={handleChange}>
                  {SITUACOES.map(situacao => <option key={situacao} value={situacao}>{situacao}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Data do protocolo</label>
                <input name="dataProtocolo" type="date" value={form.dataProtocolo} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Pessoa vinculada</label>
                <select name="pessoaId" value={form.pessoaId} onChange={handleChange}>
                  <option value="">Nenhuma</option>
                  {pessoas.map(pessoa => <option key={pessoa.id} value={pessoa.id}>{pessoa.nome}</option>)}
                </select>
              </div>
              <div className="form-group" style={{gridColumn: '1 / -1'}}>
                <label>Descrição</label>
                <input name="descricao" value={form.descricao} onChange={handleChange} />
              </div>
              <div className="form-group" style={{gridColumn: '1 / -1'}}>
                <label>Conteúdo / Observação</label>
                <textarea name="conteudo" value={form.conteudo} onChange={handleChange} rows={5} />
              </div>
            </div>
            <div className="form-actions" style={{justifyContent: 'flex-end', marginTop: '1.5rem'}}>
              <button className="btn btn-secondary" type="button" onClick={() => { setMostrarForm(false); setModalEdicaoAberto(false); setEditandoId(null); setForm(FORM_VAZIO); }}>Cancelar</button>
              <button className="btn btn-primary" type="submit" disabled={enviando}>
                {enviando ? <span className="spinner" /> : null}
                {editandoId ? 'Salvar Alterações' : 'Cadastrar Protocolo'}
              </button>
            </div>
          </form>
      </Modal>

      <div className="card">
        <h2 className="card-title">Protocolos cadastrados {!carregando && <span className="badge registro-badge">{lista.length} registros</span>}</h2>
        {carregando ? (
          <LoadingBlock texto="Carregando protocolos..." />
        ) : lista.length === 0 ? (
          <p className="vazio">Nenhum protocolo encontrado.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Número</th>
                  <th>Título</th>
                  <th>Situação</th>
                  <th>Pessoa</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaPaginada.map(protocolo => (
                  <tr key={protocolo.id}>
                    <td><span className="badge">{protocolo.id}</span></td>
                    <td><strong>{protocolo.numero}</strong></td>
                    <td>{protocolo.titulo}</td>
                    <td>
                      <span className={`badge ${protocolo.situacao === 'Concluído' ? 'alerta-sucesso' : 'badge-tipo'}`} style={{padding: '2px 8px'}}>
                        {protocolo.situacao}
                      </span>
                    </td>
                    <td>{nomePessoa(protocolo.pessoaId)}</td>
                    <td>{protocolo.dataProtocolo ? new Date(`${protocolo.dataProtocolo}T00:00:00`).toLocaleDateString('pt-BR') : '—'}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-secondary btn-sm btn-icon" title="Ver" onClick={() => setSelecionado(protocolo)}><EyeIcon size={16} /></button>
                        {(isAdmin || isSuper) && (
                          <>
                            <button className="btn btn-secondary btn-sm btn-icon" title="Editar" onClick={() => editar(protocolo)}><Edit3 size={16} /></button>
                            <button className="btn btn-danger btn-sm btn-icon" title="Excluir" onClick={() => setModalExclusaoProtocolo(protocolo)}><Trash2 size={16} /></button>
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

      <Modal aberto={!!selecionado} titulo="Detalhes do Protocolo" onClose={() => setSelecionado(null)}>
        {selecionado && (
          <div className="detail-grid">
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '4px', borderLeft: '4px solid #164b80'}}>
               <div>
                  <h3 style={{margin: 0}}>{selecionado.numero}</h3>
                  <p style={{margin: 0, fontSize: '0.9rem', color: '#5a6170'}}>{selecionado.titulo}</p>
               </div>
               <div style={{marginLeft: 'auto'}}>
                  <span className="badge badge-tipo">{selecionado.situacao}</span>
               </div>
            </div>
            
            <div className="profile-info-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
               <div className="profile-info-item">
                  <label>Tipo</label>
                  <span>{selecionado.tipo}</span>
               </div>
               <div className="profile-info-item">
                  <label>Pessoa</label>
                  <span>{nomePessoa(selecionado.pessoaId)}</span>
               </div>
               <div className="profile-info-item">
                  <label>Data de Abertura</label>
                  <span>{selecionado.dataProtocolo ? new Date(`${selecionado.dataProtocolo}T00:00:00`).toLocaleDateString('pt-BR') : '—'}</span>
               </div>
               <div className="profile-info-item">
                  <label>Status</label>
                  <span>{selecionado.situacao}</span>
               </div>
            </div>

            <div style={{marginTop: '1rem'}}>
               <p><strong>Descrição:</strong></p>
               <p style={{color: '#4a5568', marginTop: '0.25rem'}}>{selecionado.descricao || 'Nenhuma descrição fornecida.'}</p>
            </div>

            <div className="detail-text-block" style={{marginTop: '1rem'}}>
              <strong>Conteúdo do Protocolo / Observações</strong>
              <p style={{whiteSpace: 'pre-wrap', marginTop: '0.8rem'}}>{selecionado.conteudo || 'Sem observações registradas.'}</p>
            </div>
            <div className="detail-text-block" style={{marginTop: '0.5rem'}}>
              <strong>Conteúdo do Documento</strong>
              <p style={{whiteSpace: 'pre-wrap', marginTop: '0.8rem'}}>{selecionado.conteudo || 'Sem conteúdo registrado.'}</p>
            </div>
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


      <Modal aberto={!!modalExclusaoProtocolo} titulo="Confirmar Exclusão" onClose={() => setModalExclusaoProtocolo(null)}>
        {modalExclusaoProtocolo && (
          <div className="detail-grid">
            <p>Você tem certeza que deseja excluir o protocolo <strong>{modalExclusaoProtocolo.numero}</strong>?</p>
            <div className="form-actions" style={{justifyContent: 'flex-end', marginTop: '1rem'}}>
              <button className="btn btn-secondary" type="button" onClick={() => setModalExclusaoProtocolo(null)}>Cancelar</button>
              <button className="btn btn-danger" type="button" onClick={confirmarExclusao}>Excluir Protocolo</button>
            </div>
          </div>
        )}
      </Modal>

      <footer className="rodape">WPAH © {new Date().getFullYear()} — Secretaria Digital</footer>
    </div>
  );
}
