import { useState, useEffect } from 'react';
import { api } from '../api.js';

const FORM_VAZIO = { nome: '', cpf: '', email: '', telefone: '', dataNascimento: '' };

function formatarData(iso) {
  if (!iso) return '—';
  // suporta "YYYY-MM-DD" e ISO completo
  const d = iso.includes('T') ? new Date(iso) : new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('pt-BR');
}

export default function Pessoas() {
  const [lista, setLista]           = useState([]);
  const [form, setForm]             = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro]             = useState('');
  const [msg, setMsg]               = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando]     = useState(false);

  useEffect(() => { listar(); }, []);

  async function listar() {
    setCarregando(true);
    try {
      setLista(await api.getPessoas());
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
      if (editandoId) {
        await api.atualizarPessoa(editandoId, form);
        setMsg('Pessoa atualizada com sucesso.');
      } else {
        await api.criarPessoa(form);
        setMsg('Pessoa cadastrada com sucesso.');
      }
      cancelar();
      listar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  function handleEditar(p) {
    setForm({
      nome:           p.nome,
      cpf:            p.cpf,
      email:          p.email          || '',
      telefone:       p.telefone        || '',
      dataNascimento: p.dataNascimento  || '',
    });
    setEditandoId(p.id);
    setMostrarForm(true);
    setErro(''); setMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDeletar(id, nome) {
    if (!confirm(`Confirma a exclusão de "${nome}"?\nEsta ação não pode ser desfeita.`)) return;
    setErro(''); setMsg('');
    try {
      await api.deletarPessoa(id);
      setMsg('Pessoa removida com sucesso.');
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

  return (
    <div className="container">
      {/* Cabeçalho da página */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestão de Pessoas</h1>
          <p className="page-subtitle">
            Cadastro, consulta e administração de pessoas
          </p>
        </div>
        {!mostrarForm && (
          <button className="btn btn-primary" onClick={abrirNovo}>
            + Nova Pessoa
          </button>
        )}
      </div>

      {msg  && <div className="alerta alerta-sucesso">{msg}</div>}
      {erro && <div className="alerta alerta-erro">{erro}</div>}

      {/* Formulário de cadastro / edição */}
      {mostrarForm && (
        <div className="card">
          <h2 className="card-title">
            {editandoId ? '✏️ Editar Pessoa' : '➕ Cadastrar Nova Pessoa'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nome">Nome completo *</label>
                <input
                  id="nome" name="nome"
                  value={form.nome} onChange={handleChange}
                  required placeholder="Nome completo"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="cpf">CPF *</label>
                <input
                  id="cpf" name="cpf"
                  value={form.cpf} onChange={handleChange}
                  required placeholder="000.000.000-00"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email" name="email" type="email"
                  value={form.email} onChange={handleChange}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <input
                  id="telefone" name="telefone"
                  value={form.telefone} onChange={handleChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dataNascimento">Data de Nascimento</label>
                <input
                  id="dataNascimento" name="dataNascimento" type="date"
                  value={form.dataNascimento} onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={enviando}>
                {enviando ? <span className="spinner" /> : null}
                {editandoId ? 'Salvar Alterações' : 'Cadastrar Pessoa'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancelar}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela de pessoas */}
      <div className="card">
        <h2 className="card-title">
          Pessoas Cadastradas
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
          <p className="vazio">Nenhuma pessoa cadastrada. Clique em "+ Nova Pessoa" para começar.</p>
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
                {lista.map(p => (
                  <tr key={p.id}>
                    <td><span className="badge">{p.id}</span></td>
                    <td><strong>{p.nome}</strong></td>
                    <td>{p.cpf}</td>
                    <td>{p.email    || <span className="muted">—</span>}</td>
                    <td>{p.telefone || <span className="muted">—</span>}</td>
                    <td>{formatarData(p.dataNascimento)}</td>
                    <td>
                      <div className="td-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEditar(p)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeletar(p.id, p.nome)}
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
