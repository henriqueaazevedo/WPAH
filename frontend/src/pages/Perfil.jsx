import { useEffect, useState } from 'react';
import { api } from '../api.js';
import LoadingBlock from '../components/LoadingBlock.jsx';

export default function Perfil() {
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', dataNascimento: '', senha: '' });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    async function carregar() {
      // MARRETA MESTRE: Se for o ID Especial, carrega dados fixos de mestre
      if (Number(usuarioLocal.id) === 999999) {
        const dadosMestre = {
          usuario: { id: 999999, login: 'super', nome: 'Henrique Azevedo (Super User)', role: 'super', email: 'contato@wpah.com.br' },
          pessoa: { nome: 'Henrique Azevedo (Master)', cpf: '---.---.---.--', email: 'contato@wpah.com.br', telefone: '(00) 00000-0000', dataNascimento: '' }
        };
        setPerfil(dadosMestre);
        setForm({
          nome: dadosMestre.pessoa.nome,
          email: dadosMestre.pessoa.email,
          telefone: dadosMestre.pessoa.telefone,
          dataNascimento: dadosMestre.pessoa.dataNascimento,
          senha: ''
        });
        setCarregando(false);
        return;
      }

      setCarregando(true);
      try {
        const dados = await api.getPerfil(usuarioLocal.id);
        setPerfil(dados);
        setForm({
          nome: dados.pessoa?.nome || dados.usuario?.nome || '',
          email: dados.pessoa?.email || dados.usuario?.email || '',
          telefone: dados.pessoa?.telefone || '',
          dataNascimento: dados.pessoa?.dataNascimento || '',
          senha: ''
        });
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [usuarioLocal.id]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    setMsg('');
    try {
      const dados = await api.atualizarPerfil(usuarioLocal.id, form);
      setPerfil(dados);
      localStorage.setItem('usuario', JSON.stringify({ ...usuarioLocal, ...dados.usuario, pessoa: dados.pessoa }));
      setMsg('Perfil atualizado com sucesso.');
      setForm(prev => ({ ...prev, senha: '' }));
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Perfil do Usuário</h1>
          <p className="page-subtitle">Atualize seus dados de acesso e informações pessoais.</p>
        </div>
      </div>

      {erro && <div className="alerta alerta-erro">{erro}</div>}
      {msg && <div className="alerta alerta-sucesso">{msg}</div>}

      {carregando ? <LoadingBlock texto="Carregando perfil..." /> : (
        <div className="card">
          <h2 className="card-title">Dados do perfil</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome</label>
                <input name="nome" value={form.nome} onChange={handleChange} />
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
                <label>Nova senha</label>
                <input name="senha" value={form.senha} onChange={handleChange} placeholder="Preencha apenas se quiser alterar" />
              </div>
              <div className="form-group">
                <label>Login atual</label>
                <input value={perfil?.usuario?.login || ''} disabled />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" disabled={salvando}>{salvando ? <span className="spinner" /> : null}Salvar perfil</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
