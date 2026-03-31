import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api.js';

export default function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', cpf: '', telefone: '', dataNascimento: '', senha: '' });
  const [carregando, setCarregando] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCarregando(true);
    const toastId = toast.loading('Criando sua conta...');
    try {
      await api.cadastro(form);
      toast.success('Conta criada com sucesso! Faça login para continuar.', { id: toastId });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.message || 'Erro ao cadastrar. Verifique os dados fornecidos.', { id: toastId });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1>🏛️ Sistema WPAH</h1>
        <p>Gestão de Pessoas e Documentos — Criação de Conta</p>
      </div>

      <div className="auth-card">
        <h2>Criar Nova Conta</h2>

        {carregando && (
          <div className="auth-inline-loading" aria-live="polite" aria-label="Carregando cadastro">
            <span className="mini-loader" />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={form.nome}
              onChange={handleChange}
              placeholder="Seu nome completo"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <input
              id="cpf"
              name="cpf"
              type="text"
              value={form.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <input
              id="telefone"
              name="telefone"
              type="text"
              value={form.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="form-group">
            <label htmlFor="dataNascimento">Data de nascimento</label>
            <input
              id="dataNascimento"
              name="dataNascimento"
              type="date"
              value={form.dataNascimento}
              onChange={handleChange}
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
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{marginTop: '1.5rem'}} disabled={carregando}>
            {carregando ? <span className="spinner" /> : null}
            {carregando ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>

        <div className="auth-rodape">
          Já tem conta? <Link to="/login">Fazer login</Link>
        </div>
      </div>

      <footer className="rodape">
        WPAH &copy; {new Date().getFullYear()} — Todos os direitos reservados
      </footer>
    </div>
  );
}
