import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import Modal from '../components/Modal.jsx';
import LoadingBlock from '../components/LoadingBlock.jsx';
import Pagination from '../components/Pagination.jsx';
import toast from 'react-hot-toast';
import { 
  UserPlus, 
  Search, 
  Trash2, 
  Edit3, 
  Eye as EyeIcon, 
  Clock, 
  ShieldCheck, 
  User as UserIcon,
  Filter
} from 'lucide-react';

const FORM_VAZIO = {
  nome: '',
  cpf: '',
  rg: '', // Novo campo básico
  email: '',
  telefone: '',
  dataNascimento: '',
  statusSigiloso: '', // Campo Super User
  obsSigilosa: ''      // Campo Super User
};

function formatarData(valor) {
  if (!valor) return '—';
  const data = new Date(valor);
  return isNaN(data.getTime()) ? '—' : data.toLocaleDateString('pt-BR');
}

function formatarDataHora(valor) {
  if (!valor) return '—';
  const data = new Date(valor);
  return isNaN(data.getTime()) ? '—' : data.toLocaleString('pt-BR');
}

export default function Pessoas() {
  const PAGE_SIZE = 8;
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [filtros, setFiltros] = useState({ q: '', startDate: '', endDate: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [modalExclusaoPessoa, setModalExclusaoPessoa] = useState(null);
  const [selecionada, setSelecionada] = useState(null);
  const [credenciaisGeradas, setCredenciaisGeradas] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || '{}');
  const userRole = String(usuarioLogado.role || '').toLowerCase();
  const userLogin = String(usuarioLogado.login || '').toLowerCase();
  const userName = String(usuarioLogado.nome || '').toLowerCase();
  
  // REGRA SUPREMA: Acesso total apenas para 'super'.
  const isSuper = userLogin === 'super' || userRole === 'super';
  const isAdmin = isSuper || userRole === 'admin' || userLogin === 'admin';
  const isUserComum = !isAdmin && !isSuper;

  const listaFiltrada = useMemo(() => {
    if (isSuper) return lista;
    
    // Se for User comum, ele só vê a si próprio
    if (isUserComum) {
      return lista.filter(p => p.id === usuarioLogado.pessoaId || p.cpf === usuarioLogado.cpf);
    }

    // Se for Admin, ele vê todos (menos o Super User)
    return lista.filter(p => {
      const eSuper = p.role === 'super' || p.usuario?.role === 'super' || p.login === 'super' || p.usuario?.login === 'super';
      return !eSuper;
    });
  }, [lista, isSuper, isUserComum, usuarioLogado]);

  const listaPaginada = useMemo(() => {
    const inicio = (paginaAtual - 1) * PAGE_SIZE;
    return listaFiltrada.slice(inicio, inicio + PAGE_SIZE);
  }, [listaFiltrada, paginaAtual]);

  useEffect(() => {
    const totalPaginas = Math.max(1, Math.ceil(lista.length / PAGE_SIZE));
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [lista, paginaAtual]);

  useEffect(() => {
    listar();
  }, []);

  async function listar(params = filtros) {
    setCarregando(true);
    try {
      const dados = await api.getPessoas(params);
      setLista(dados);
      setPaginaAtual(1);
    } catch (e) {
      toast.error('Erro ao carregar pessoas: ' + e.message);
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
      if (editandoId) {
        await api.atualizarPessoa(editandoId, form);
        toast.success('Pessoa atualizada com sucesso.', { id: toastId });
      } else {
        const resposta = await api.criarPessoa(form);
        toast.success('Pessoa cadastrada com sucesso.', { id: toastId });
        if (resposta.acesso) {
          setCredenciaisGeradas({
            nome: resposta.nome,
            login: resposta.acesso.login,
            senha: resposta.acesso.senha
          });
        }
      }

      cancelar();
      listar();
    } catch (e) {
      toast.error(e.message, { id: toastId });
    } finally {
      setEnviando(false);
    }
  }

  function handleEditar(pessoa) {
    setForm({
      nome: pessoa.nome,
      cpf: pessoa.cpf,
      rg: pessoa.rg || '',
      email: pessoa.email || '',
      telefone: pessoa.telefone || '',
      dataNascimento: pessoa.dataNascimento || '',
      statusSigiloso: pessoa.statusSigiloso || '',
      obsSigilosa: pessoa.obsSigilosa || ''
    });
    setEditandoId(pessoa.id);
    setModalEdicaoAberto(true);
  }

  async function confirmarExclusao() {
    if (!modalExclusaoPessoa) return;
    const toastId = toast.loading('Excluindo...');
    try {
      await api.deletarPessoa(modalExclusaoPessoa.id);
      toast.success('Pessoa removida com sucesso.', { id: toastId });
      setModalExclusaoPessoa(null);
      listar();
    } catch (e) {
      toast.error(e.message, { id: toastId });
    }
  }

  function cancelar() {
    setForm(FORM_VAZIO);
    setEditandoId(null);
    setMostrarForm(false);
    setModalEdicaoAberto(false);
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestão de Pessoas</h1>
          <p className="page-subtitle">Cadastro completo com geração automática de acesso.</p>
        </div>
        {!mostrarForm && isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditandoId(null); setForm(FORM_VAZIO); setMostrarForm(true); }}>
            <UserPlus size={18} /> Nova Pessoa
          </button>
        )}
      </div>

      <div className="card">
        <h2 className="card-title"><Filter size={18} style={{verticalAlign: 'middle', marginRight: '8px'}} /> Filtros de busca</h2>
        <form className="filter-bar" onSubmit={aplicarFiltros}>
          <input name="q" value={filtros.q} onChange={handleFiltroChange} placeholder="Buscar por nome, CPF, e-mail ou telefone" />
          <input name="startDate" type="date" value={filtros.startDate} onChange={handleFiltroChange} />
          <input name="endDate" type="date" value={filtros.endDate} onChange={handleFiltroChange} />
          <button className="btn btn-primary" type="submit"><Search size={16} /> Filtrar</button>
          <button className="btn btn-secondary" type="button" onClick={limparFiltros}>Limpar</button>
        </form>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO UNIFICADO */}
      <Modal aberto={mostrarForm || modalEdicaoAberto} titulo={editandoId ? 'Editar Pessoa' : 'Cadastrar Nova Pessoa'} onClose={cancelar}>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome completo *</label>
                <input name="nome" value={form.nome} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>CPF *</label>
                <input name="cpf" value={form.cpf} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>RG</label>
                <input name="rg" value={form.rg} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input name="telefone" value={form.telefone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Data de nascimento</label>
                <input name="dataNascimento" type="date" value={form.dataNascimento} onChange={handleChange} />
              </div>
              
              {!editandoId && (
                <div className="form-group">
                   <label>Senha Inicial (opcional)</label>
                   <input name="senha" type="password" value={form.senha} onChange={handleChange} placeholder="6 dígitos do CPF por padrão" />
                </div>
              )}

              {isSuper && (
                <>
                  <div style={{gridColumn: '1 / -1', padding: '10px', background: '#f0fdf4', borderRadius: '4px', border: '1px solid #dcfce7', marginBottom: '10px'}}>
                     <h4 style={{fontSize: '0.85rem', color: '#166534', margin: '0 0 8px 0'}}>🔒 Dados Privados (Exclusivo Super User)</h4>
                     <div className="form-grid" style={{marginTop: '10px'}}>
                        <div className="form-group">
                           <label>Status Especial</label>
                           <select name="statusSigiloso" value={form.statusSigiloso} onChange={handleChange}>
                              <option value="Normal">Normal</option>
                              <option value="Observação">Em Observação</option>
                              <option value="Restrito">Restrito</option>
                           </select>
                        </div>
                        <div className="form-group">
                           <label>Nível de Auditoria</label>
                           <input name="obsSigilosa" value={form.obsSigilosa} onChange={handleChange} placeholder="Notas do Super User" />
                        </div>
                     </div>
                  </div>
                </>
              )}
            </div>
            <div className="form-actions" style={{justifyContent: 'flex-end', marginTop: '1.5rem'}}>
              <button className="btn btn-secondary" type="button" onClick={cancelar}>Cancelar</button>
              <button className="btn btn-primary" type="submit" disabled={enviando}>
                {enviando ? <span className="spinner" /> : null}
                {editandoId ? 'Salvar Alterações' : 'Cadastrar Pessoa'}
              </button>
            </div>
          </form>
      </Modal>

      <div className="card">
        <h2 className="card-title">
          Pessoas cadastradas
          {!carregando && <span className="badge registro-badge">{lista.length} registros</span>}
        </h2>

        {carregando ? (
          <LoadingBlock texto="Carregando pessoas..." />
        ) : lista.length === 0 ? (
          <p className="vazio">Nenhuma pessoa encontrada.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                   <th>Nome</th>
                   <th>CPF</th>
                   <th>E-mail</th>
                   <th>Último Acesso</th>
                   <th>Nascimento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaPaginada.map(pessoa => (
                  <tr key={pessoa.id}>
                    <td><span className="badge">{pessoa.id}</span></td>
                     <td><strong>{pessoa.nome}</strong></td>
                     <td>{pessoa.cpf}</td>
                     <td>{pessoa.email || <span className="muted">—</span>}</td>
                     <td style={{fontSize: '0.85rem'}}>{formatarDataHora(pessoa.usuario?.ultimoAcesso || pessoa.ultimoAcesso)}</td>
                     <td>{formatarData(pessoa.dataNascimento)}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-secondary btn-sm btn-icon" title="Ver" onClick={() => setSelecionada(pessoa)}><EyeIcon size={16} /></button>
                        {(isAdmin || isSuper) && (
                          <>
                            <button className="btn btn-secondary btn-sm btn-icon" title="Editar" onClick={() => handleEditar(pessoa)}><Edit3 size={16} /></button>
                            <button className="btn btn-danger btn-sm btn-icon" title="Excluir" onClick={() => setModalExclusaoPessoa(pessoa)}><Trash2 size={16} /></button>
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
              totalItems={listaFiltrada.length}
              pageSize={PAGE_SIZE}
              onChange={setPaginaAtual}
            />
          </div>
        )}
      </div>

      <Modal aberto={!!selecionada} titulo="Detalhes da Pessoa" onClose={() => setSelecionada(null)}>
        {selecionada && (
          <div className="detail-grid">
            <div className="profile-card-inicio" style={{gridTemplateColumns: '80px 1fr'}}>
              <div className="profile-avatar-placeholder" style={{width: '80px', height: '80px'}}>
                <UserIcon size={32} />
              </div>
              <div className="profile-info-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
                <div className="profile-info-item">
                  <label>Nome</label>
                  <span style={{fontSize: '1.1rem', color: 'var(--primary)'}}>{selecionada.nome}</span>
                </div>
                <div className="profile-info-item">
                  <label>CPF</label>
                  <span>{selecionada.cpf}</span>
                </div>
                {selecionada.rg && (
                   <div className="profile-info-item">
                      <label>RG</label>
                      <span>{selecionada.rg}</span>
                   </div>
                )}
                <div className="profile-info-item">
                  <label>E-mail</label>
                  <span>{selecionada.email || '—'}</span>
                </div>
                <div className="profile-info-item">
                  <label>Telefone</label>
                  <span>{selecionada.telefone || '—'}</span>
                </div>
                <div className="profile-info-item">
                  <label>Nascimento</label>
                  <span>{formatarData(selecionada.dataNascimento)}</span>
                </div>
                <div className="profile-info-item">
                  <label>Cadastro em</label>
                  <span>{formatarData(selecionada.criadoEm)}</span>
                </div>
                {isAdmin && selecionada.usuario && (
                   <div className="profile-info-item" style={{gridColumn: '1 / -1', marginTop: '8px', padding: '8px', background: '#f8fafc', borderRadius: '4px'}}>
                      <label><Clock size={12} /> Último Acesso</label>
                      <span>{formatarData(selecionada.usuario.ultimoAcesso)}</span>
                   </div>
                )}
              </div>
            </div>
            {isSuper && (
               <div style={{marginTop: '1rem', padding: '1rem', border: '1px dashed #d3d8df', borderRadius: '4px', background: '#fffef0'}}>
                  <h4 style={{fontSize: '0.8rem', color: '#856404', marginBottom: '0.5rem'}}><ShieldCheck size={14} /> Dados Sigilosos (Super User)</h4>
                  <p style={{fontSize: '0.85rem'}}><strong>Status:</strong> {selecionada.statusSigiloso || 'Normal'}</p>
                  <p style={{fontSize: '0.85rem', marginTop: '4px'}}><strong>Obs:</strong> {selecionada.obsSigilosa || 'Sem observações.'}</p>
               </div>
            )}
            {isAdmin && (
              <div style={{marginTop: '1.5rem', display: 'flex', gap: '1rem'}}>
                <button className="btn btn-primary" onClick={() => { handleEditar(selecionada); setSelecionada(null); }}>
                  <Edit3 size={16} /> Editar esta Pessoa
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>


      <Modal aberto={!!modalExclusaoPessoa} titulo="Confirmar Exclusão" onClose={() => setModalExclusaoPessoa(null)}>
        {modalExclusaoPessoa && (
          <div className="detail-grid">
            <p>Você tem certeza que deseja excluir <strong>{modalExclusaoPessoa.nome}</strong>? Esta ação removerá também o acesso do usuário.</p>
            <div className="form-actions" style={{justifyContent: 'flex-end', marginTop: '1rem'}}>
              <button className="btn btn-secondary" type="button" onClick={() => setModalExclusaoPessoa(null)}>Cancelar</button>
              <button className="btn btn-danger" type="button" onClick={confirmarExclusao}>Excluir Registro</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal aberto={!!credenciaisGeradas} titulo="Acesso Gerado" onClose={() => setCredenciaisGeradas(null)}>
        {credenciaisGeradas && (
          <div className="detail-grid" style={{background: '#f0f9ff', padding: '1rem', borderRadius: '4px', border: '1px solid #bae6fd'}}>
            <p style={{marginBottom: '0.5rem'}}>Usuário criado com sucesso!</p>
            <p><strong>Nome:</strong> {credenciaisGeradas.nome}</p>
            <p><strong>Login:</strong> <code style={{background: '#fff', padding: '2px 4px'}}>{credenciaisGeradas.login}</code></p>
            <p><strong>Senha:</strong> <code style={{background: '#fff', padding: '2px 4px'}}>{credenciaisGeradas.senha}</code></p>
            <p style={{marginTop: '0.5rem', fontSize: '0.8rem', color: '#0369a1'}}>Anote essas informações ou repasse ao usuário.</p>
          </div>
        )}
      </Modal>

      <footer className="rodape">WPAH © {new Date().getFullYear()} — Secretaria Digital</footer>
    </div>
  );
}
