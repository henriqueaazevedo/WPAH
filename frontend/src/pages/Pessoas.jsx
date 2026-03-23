import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import Modal from '../components/Modal.jsx';
import LoadingBlock from '../components/LoadingBlock.jsx';
import Pagination from '../components/Pagination.jsx';

const FORM_VAZIO = {
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  dataNascimento: '',
  senha: ''
};

function formatarData(valor) {
  if (!valor) return '—';
  const data = new Date(String(valor).includes('T') ? valor : `${valor}T00:00:00`);
  return data.toLocaleDateString('pt-BR');
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
    listar();
  }, []);

  async function listar(params = filtros) {
    setCarregando(true);
    try {
      const dados = await api.getPessoas(params);
      setLista(dados);
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
    setErro('');
    setMsg('');
    setEnviando(true);

    try {
      if (editandoId) {
        await api.atualizarPessoa(editandoId, form);
        setMsg('Pessoa atualizada com sucesso.');
      } else {
        const resposta = await api.criarPessoa(form);
        setMsg('Pessoa cadastrada com sucesso.');
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
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  function handleEditar(pessoa) {
    setForm({
      nome: pessoa.nome,
      cpf: pessoa.cpf,
      email: pessoa.email || '',
      telefone: pessoa.telefone || '',
      dataNascimento: pessoa.dataNascimento || '',
      senha: ''
    });
    setEditandoId(pessoa.id);
    setModalEdicaoAberto(true);
  }

  async function confirmarExclusao() {
    if (!modalExclusaoPessoa) return;
    try {
      await api.deletarPessoa(modalExclusaoPessoa.id);
      setMsg('Pessoa removida com sucesso.');
      setModalExclusaoPessoa(null);
      listar();
    } catch (e) {
      setErro(e.message);
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
        {!mostrarForm && (
          <button className="btn btn-primary" onClick={() => { setEditandoId(null); setForm(FORM_VAZIO); setMostrarForm(true); }}>
            + Nova Pessoa
          </button>
        )}
      </div>

      {msg && <div className="alerta alerta-sucesso">{msg}</div>}
      {erro && <div className="alerta alerta-erro">{erro}</div>}

      <div className="card">
        <h2 className="card-title">Filtros da sessão</h2>
        <form className="filter-bar" onSubmit={aplicarFiltros}>
          <input name="q" value={filtros.q} onChange={handleFiltroChange} placeholder="Buscar por nome, CPF, e-mail ou telefone" />
          <input name="startDate" type="date" value={filtros.startDate} onChange={handleFiltroChange} />
          <input name="endDate" type="date" value={filtros.endDate} onChange={handleFiltroChange} />
          <button className="btn btn-primary" type="submit">Filtrar</button>
          <button className="btn btn-secondary" type="button" onClick={limparFiltros}>Limpar</button>
        </form>
      </div>

      {mostrarForm && (
        <div className="card">
          <h2 className="card-title">{editandoId ? 'Editar pessoa' : 'Cadastrar nova pessoa'}</h2>
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
              <div className="form-group">
                <label>Senha inicial {editandoId ? '(opcional)' : '(opcional)'}</label>
                <input name="senha" type="text" value={form.senha} onChange={handleChange} placeholder="Se vazio, usa os 6 últimos dígitos do CPF" />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={enviando}>
                {enviando ? <span className="spinner" /> : null}
                {editandoId ? 'Salvar alterações' : 'Cadastrar pessoa'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={cancelar}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

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
                  <th>Telefone</th>
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
                    <td>{pessoa.telefone || <span className="muted">—</span>}</td>
                    <td>{formatarData(pessoa.dataNascimento)}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-secondary btn-sm btn-icon" title="Ver" onClick={() => setSelecionada(pessoa)}>◉</button>
                        <button className="btn btn-secondary btn-sm btn-icon" title="Editar" onClick={() => handleEditar(pessoa)}>✎</button>
                        <button className="btn btn-danger btn-sm btn-icon" title="Excluir" onClick={() => setModalExclusaoPessoa(pessoa)}>✕</button>
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

      <Modal aberto={!!selecionada} titulo="Detalhes da pessoa" onClose={() => setSelecionada(null)}>
        {selecionada && (
          <div className="detail-grid">
            <p><strong>Nome:</strong> {selecionada.nome}</p>
            <p><strong>CPF:</strong> {selecionada.cpf}</p>
            <p><strong>E-mail:</strong> {selecionada.email || '—'}</p>
            <p><strong>Telefone:</strong> {selecionada.telefone || '—'}</p>
            <p><strong>Nascimento:</strong> {formatarData(selecionada.dataNascimento)}</p>
            <p><strong>Cadastro:</strong> {formatarData(selecionada.criadoEm)}</p>
          </div>
        )}
      </Modal>

      <Modal aberto={modalEdicaoAberto} titulo="Editar pessoa" onClose={cancelar}>
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
            <div className="form-group">
              <label>Senha inicial (opcional)</label>
              <input name="senha" type="text" value={form.senha} onChange={handleChange} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={enviando}>{enviando ? <span className="spinner" /> : null}Salvar alterações</button>
            <button className="btn btn-secondary" type="button" onClick={cancelar}>Cancelar</button>
          </div>
        </form>
      </Modal>

      <Modal aberto={!!modalExclusaoPessoa} titulo="Confirmar exclusão" onClose={() => setModalExclusaoPessoa(null)}>
        {modalExclusaoPessoa && (
          <div className="detail-grid">
            <p>Confirma excluir <strong>{modalExclusaoPessoa.nome}</strong>?</p>
            <div className="form-actions">
              <button className="btn btn-danger" type="button" onClick={confirmarExclusao}>Excluir</button>
              <button className="btn btn-secondary" type="button" onClick={() => setModalExclusaoPessoa(null)}>Cancelar</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal aberto={!!credenciaisGeradas} titulo="Acesso gerado para a pessoa" onClose={() => setCredenciaisGeradas(null)}>
        {credenciaisGeradas && (
          <div className="detail-grid">
            <p><strong>Nome:</strong> {credenciaisGeradas.nome}</p>
            <p><strong>Login:</strong> {credenciaisGeradas.login}</p>
            <p><strong>Senha inicial:</strong> {credenciaisGeradas.senha}</p>
          </div>
        )}
      </Modal>

      <footer className="rodape">WPAH © {new Date().getFullYear()} — Gestão de Pessoas</footer>
    </div>
  );
}
