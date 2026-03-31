import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api.js';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ acesso: '', senha: '' });
  const [carregando, setCarregando] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCarregando(true);
    const toastId = toast.loading('Autenticando...');
    try {
      const res = await api.login(form);
      localStorage.setItem('usuario', JSON.stringify(res.usuario));
      toast.success('Bem-vindo ao sistema!', { id: toastId });
      setTimeout(() => navigate('/inicio'), 500);
    } catch (err) {
      toast.error(err.message || 'Erro ao entrar. Verifique suas credenciais.', { id: toastId });
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
            <div className="password-wrap">
              <input
                id="senha"
                name="senha"
                type={showPassword ? 'text' : 'password'}
                value={form.senha}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{marginTop: '1.5rem'}} disabled={carregando}>
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
