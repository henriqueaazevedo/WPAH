import { useEffect, useState } from 'react';
import { User, Mail, CreditCard, Phone, Calendar, Clock, Shield, TrendingUp, DollarSign, PieChart, Activity } from 'lucide-react';
import { api } from '../api.js';
import LoadingBlock from '../components/LoadingBlock.jsx';

export default function Inicio() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    async function carregar() {
      try {
        setDados(await api.getTransparencia());
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const formatarData = (data) => {
    if (!data) return 'Não informado';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bem-vindo, {usuario.nome?.split(' ')[0]}!</h1>
          <p className="page-subtitle">Página inicial com resumo de atividades e perfil do usuário.</p>
        </div>
      </div>
      
      {erro && <div className="alerta alerta-erro">{erro}</div>}
      
      {carregando ? <LoadingBlock texto="Carregando painel principal..." /> : dados && (
        <>
          <div className="summary-grid">
            <div className="summary-card">
               <div className="summary-card-icon" style={{background: '#e0f2fe', color: '#0369a1'}}><Activity size={24} /></div>
               <div>
                  <strong>{dados.totais.protocolos}</strong>
                  <span>Protocolos</span>
               </div>
            </div>
            <div className="summary-card">
               <div className="summary-card-icon" style={{background: '#fef3c7', color: '#92400e'}}><TrendingUp size={24} /></div>
               <div>
                  <strong>{dados.totais.pessoas}</strong>
                  <span>Pessoas</span>
               </div>
            </div>
            <div className="summary-card">
               <div className="summary-card-icon" style={{background: '#dcfce7', color: '#166534'}}><DollarSign size={24} /></div>
               <div>
                  <strong>R$ 45.2k</strong>
                  <span>Valores em Aberto</span>
               </div>
            </div>
            <div className="summary-card">
               <div className="summary-card-icon" style={{background: '#f3e8ff', color: '#6b21a8'}}><PieChart size={24} /></div>
               <div>
                  <strong>85%</strong>
                  <span>Eficiência</span>
               </div>
            </div>
          </div>

          <div className="card" style={{marginTop: '2rem'}}>
            <h2 className="card-title">Resumo do Meu Perfil</h2>
            <div className="profile-card-inicio">
              <div className="profile-avatar-placeholder">
                <User size={64} />
              </div>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <label><User size={14} /> Nome Completo</label>
                  <span>{usuario.nome}</span>
                </div>
                <div className="profile-info-item">
                  <label><Mail size={14} /> E-mail de Acesso</label>
                  <span>{usuario.email || 'Não informado'}</span>
                </div>
                <div className="profile-info-item">
                  <label><CreditCard size={14} /> CPF Vinculado</label>
                  <span>{usuario.pessoa?.cpf || 'Não vinculado'}</span>
                </div>
                <div className="profile-info-item">
                  <label><Shield size={14} /> Nível de Acesso</label>
                  <span style={{textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
                    {usuario.role === 'super' ? <Shield size={16} fill="#fbbf24" color="#fbbf24" /> : null}
                    {usuario.role === 'admin' ? <Shield size={16} fill="#164b80" color="#164b80" /> : null}
                    {usuario.role || 'Usuário'}
                  </span>
                </div>
                <div className="profile-info-item">
                  <label><Phone size={14} /> Contato</label>
                  <span>{usuario.pessoa?.telefone || 'Não informado'}</span>
                </div>
                <div className="profile-info-item">
                  <label><Calendar size={14} /> Data Nascimento</label>
                  <span>{formatarData(usuario.pessoa?.dataNascimento)}</span>
                </div>
                <div className="profile-info-item" style={{gridColumn: '1 / -1'}}>
                  <label><Clock size={14} /> Último Acesso Registrado</label>
                  <span>{formatarData(usuario.ultimoAcesso) || 'Primeiro acesso'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="summary-grid" style={{marginTop: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'}}>
             <div className="card" style={{margin: 0}}>
                <h3 className="card-title" style={{fontSize: '1rem'}}>Minhas Atividades Recentes</h3>
                <p className="vazio" style={{padding: '1rem'}}>Nenhuma atividade recente para exibir.</p>
             </div>
             <div className="card" style={{margin: 0}}>
                <h3 className="card-title" style={{fontSize: '1rem'}}>Avisos do Sistema</h3>
                <div style={{padding: '1rem'}}>
                   <div style={{padding: '8px', background: '#fff9db', borderLeft: '4px solid #fab005', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '0.5rem'}}>
                      Lembrete: Mantenha seus dados de contato sempre atualizados.
                   </div>
                   <div style={{padding: '8px', background: '#e7f5ff', borderLeft: '4px solid #228be6', borderRadius: '4px', fontSize: '0.85rem'}}>
                      Novas funcionalidades adicionadas ao módulo de Pessoas.
                   </div>
                </div>
             </div>
          </div>
        </>
      )}
      
      <footer className="rodape">WPAH © {new Date().getFullYear()} — Painel de Controle Digital</footer>
    </div>
  );
}
