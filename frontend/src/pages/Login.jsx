import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ acesso: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const res = await api.login(form);
      localStorage.setItem('usuario', JSON.stringify(res.usuario));
      navigate('/pessoas');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1>🏛️ Sistema WPAH</h1>
        <p>Gestão de Pessoas e Documentos — Acesso Restrito</p>
      </div>

      <div className="auth-card">
        <h2>Acesso ao Sistema</h2>

        {carregando && (
          <div className="auth-inline-loading" aria-live="polite" aria-label="Carregando login">
            <span className="mini-loader" />
          </div>
        )}

        {erro && <div className="alerta alerta-erro">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="acesso">E-mail ou login</label>
            <input
              id="acesso"
              name="acesso"
              type="text"
              value={form.acesso}
              onChange={handleChange}
              placeholder="seu@email.com ou login gerado"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              name="senha"
              type="password"
              value={form.senha}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={carregando}>
            {carregando ? <span className="spinner" /> : null}
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-rodape">
          Não tem conta? <Link to="/cadastro">Cadastre-se aqui</Link>
        </div>
      </div>

      <footer className="rodape">
        WPAH &copy; {new Date().getFullYear()} — Todos os direitos reservados
      </footer>
    </div>
  );
}
