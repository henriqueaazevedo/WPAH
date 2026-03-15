import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Modal from '../components/Modal.jsx';
import LoadingBlock from '../components/LoadingBlock.jsx';

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
  const [lista, setLista] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [filtros, setFiltros] = useState({ q: '', startDate: '', endDate: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

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
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  async function listar(params = filtros) {
    setCarregando(true);
    try {
      setLista(await api.getProtocolos(params));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
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

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
        await api.atualizarProtocolo(editandoId, payload);
        setMsg('Protocolo atualizado com sucesso.');
      } else {
        await api.criarProtocolo(payload);
        setMsg('Protocolo cadastrado com sucesso.');
      }
      setForm(FORM_VAZIO);
      setEditandoId(null);
      setMostrarForm(false);
      listar();
    } catch (e) {
      setErro(e.message);
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
    setMostrarForm(true);
  }

  async function excluir(protocolo) {
    if (!window.confirm(`Confirma a exclusão do protocolo "${protocolo.numero}"?`)) return;
    try {
      await api.deletarProtocolo(protocolo.id);
      setMsg('Protocolo removido com sucesso.');
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
          <h1 className="page-title">Protocolos</h1>
          <p className="page-subtitle">Controle completo de solicitações e tramitações.</p>
        </div>
        {!mostrarForm && <button className="btn btn-primary" onClick={() => setMostrarForm(true)}>+ Novo Protocolo</button>}
      </div>

      {msg && <div className="alerta alerta-sucesso">{msg}</div>}
      {erro && <div className="alerta alerta-erro">{erro}</div>}

      <div className="card">
        <h2 className="card-title">Busca e período</h2>
        <form className="filter-bar" onSubmit={aplicarFiltros}>
          <input name="q" value={filtros.q} onChange={handleFiltroChange} placeholder="Buscar por número, título, tipo ou situação" />
          <input name="startDate" type="date" value={filtros.startDate} onChange={handleFiltroChange} />
          <input name="endDate" type="date" value={filtros.endDate} onChange={handleFiltroChange} />
          <button className="btn btn-primary" type="submit">Filtrar</button>
          <button className="btn btn-secondary" type="button" onClick={limparFiltros}>Limpar</button>
        </form>
      </div>

      {mostrarForm && (
        <div className="card">
          <h2 className="card-title">{editandoId ? 'Editar protocolo' : 'Cadastrar novo protocolo'}</h2>
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
              <div className="form-group full">
                <label>Descrição</label>
                <input name="descricao" value={form.descricao} onChange={handleChange} />
              </div>
              <div className="form-group full">
                <label>Conteúdo</label>
                <textarea name="conteudo" value={form.conteudo} onChange={handleChange} rows={5} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={enviando}>{enviando ? <span className="spinner" /> : null}{editandoId ? 'Salvar alterações' : 'Cadastrar protocolo'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => { setMostrarForm(false); setEditandoId(null); setForm(FORM_VAZIO); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Protocolos cadastrados {!carregando && <span className="badge registro-badge">{lista.length} registros</span>}</h2>
        {carregando ? (
          <LoadingBlock texto="Carregando protocolos..." />
        ) : lista.length === 0 ? (
          <p className="vazio">Nenhum protocolo encontrado para os filtros informados.</p>
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
                {lista.map(protocolo => (
                  <tr key={protocolo.id}>
                    <td><span className="badge">{protocolo.id}</span></td>
                    <td><strong>{protocolo.numero}</strong></td>
                    <td>{protocolo.titulo}</td>
                    <td><span className="badge badge-tipo">{protocolo.situacao}</span></td>
                    <td>{nomePessoa(protocolo.pessoaId)}</td>
                    <td>{protocolo.dataProtocolo ? new Date(`${protocolo.dataProtocolo}T00:00:00`).toLocaleDateString('pt-BR') : '—'}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelecionado(protocolo)}>Ver</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => editar(protocolo)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => excluir(protocolo)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal aberto={!!selecionado} titulo="Detalhes do protocolo" onClose={() => setSelecionado(null)}>
        {selecionado && (
          <div className="detail-grid">
            <p><strong>Número:</strong> {selecionado.numero}</p>
            <p><strong>Título:</strong> {selecionado.titulo}</p>
            <p><strong>Tipo:</strong> {selecionado.tipo}</p>
            <p><strong>Situação:</strong> {selecionado.situacao}</p>
            <p><strong>Pessoa:</strong> {nomePessoa(selecionado.pessoaId)}</p>
            <p><strong>Descrição:</strong> {selecionado.descricao || '—'}</p>
            <div className="detail-text-block">
              <strong>Conteúdo</strong>
              <p>{selecionado.conteudo || 'Sem conteúdo registrado.'}</p>
            </div>
          </div>
        )}
      </Modal>

      <footer className="rodape">WPAH © {new Date().getFullYear()} — Protocolos</footer>
    </div>
  );
}
