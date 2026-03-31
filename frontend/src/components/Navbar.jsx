import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, User, LogOut, Shield } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

export default function Navbar() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [saindo, setSaindo] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);

  function sair() {
    if (saindo) return;
    setSaindo(true);
    localStorage.removeItem('usuario');
    setTimeout(() => navigate('/login'), 220);
  }

  const roleBadge = () => {
    if (usuario.role === 'super') return <span className="navbar-tag" style={{borderColor: '#fbbf24', color: '#fbbf24'}}><Shield size={12} fill="#fbbf24" /> Super User</span>;
    if (usuario.role === 'admin') return <span className="navbar-tag"><Shield size={12} fill="#164b80" /> Admin</span>;
    return null;
  };

  return (
    <header className="main-header">
      <div className="gov-feedback-bar">
        WPAH | Sistema de Gestão Interna da Secretaria Digital
      </div>
      <div className="site-header">
        <div className="site-header-inner">
          <div className="header-left">
            <button 
              className="menu-toggle-btn" 
              onClick={() => setSideOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>
            <Link to="/inicio" className="site-logo">
              <span className="logo-text">WPAH</span>
              <span className="logo-divider">/</span>
              <span className="logo-subtext">Secretaria</span>
            </Link>
          </div>

          <div className="header-right">
            {roleBadge()}
            <div className="user-pill" onClick={() => navigate('/perfil')}>
              <div className="user-avatar-mini">
                <User size={16} />
              </div>
              <span className="user-name-mini">{usuario.nome?.split(' ')[0]}</span>
            </div>
            <button 
              className="btn-exit-header" 
              onClick={sair} 
              disabled={saindo}
              title="Sair do sistema"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <Sidebar 
        isOpen={sideOpen} 
        toggle={() => setSideOpen(!sideOpen)} 
        usuario={usuario} 
        sair={sair}
      />
    </header>
  );
}
