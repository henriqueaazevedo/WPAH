import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [saindo, setSaindo] = useState(false);

  function sair() {
    if (saindo) return;
    setSaindo(true);
    localStorage.removeItem('usuario');
    setTimeout(() => navigate('/login'), 220);
  }

  function ativo(path) {
    return location.pathname.startsWith(path) ? 'navbar-link ativo' : 'navbar-link';
  }

  return (
    <header>
      <div className="gov-feedback-bar">
        Queremos ouvir voce: avalie o novo portal e ajude a melhorar os servicos digitais.
      </div>
      <div className="site-header">
        <div className="site-header-inner">
          <Link to="/pessoas" className="site-logo">WPAH | Secretaria Digital</Link>
        </div>
      </div>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-nav">
            <Link to="/pessoas" className={ativo('/pessoas')}>Pessoas e Cadastros</Link>
            <Link to="/documentos" className={ativo('/documentos')}>Leis e Documentos</Link>
            <Link to="/protocolos" className={ativo('/protocolos')}>Protocolos</Link>
            <Link to="/servicos" className={ativo('/servicos')}>Servicos</Link>
            <Link to="/transparencia" className={ativo('/transparencia')}>Transparencia</Link>
          </div>
          <div className="navbar-usuario">
            <Link to="/perfil" className={ativo('/perfil')}>Perfil</Link>
            <span className="navbar-tag">{usuario.nome || 'Usuario'}</span>
            <button className="btn btn-sm btn-logout" onClick={sair} type="button" disabled={saindo}>
              {saindo ? <span className="spinner" /> : null}
              {saindo ? 'Saindo...' : 'Sair'}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
