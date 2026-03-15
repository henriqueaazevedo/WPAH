import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [termo, setTermo] = useState('');

  function sair() {
    localStorage.removeItem('usuario');
    navigate('/login');
  }

  function ativo(path) {
    return location.pathname.startsWith(path) ? 'navbar-link ativo' : 'navbar-link';
  }

  function buscar(e) {
    e.preventDefault();
    navigate(`/busca?q=${encodeURIComponent(termo)}`);
  }

  return (
    <header>
      <div className="gov-feedback-bar">
        Queremos ouvir voce: avalie o novo portal e ajude a melhorar os servicos digitais.
      </div>
      <div className="site-header">
        <div className="site-header-inner">
          <Link to="/pessoas" className="site-logo">WPAH | Secretaria Digital</Link>
          <form className="site-tools" onSubmit={buscar}>
            <div className="site-search site-search-wide">
              <input
                type="text"
                placeholder="Buscar pessoas, documentos ou protocolos"
                aria-label="Buscar"
                value={termo}
                onChange={e => setTermo(e.target.value)}
              />
              <button type="submit" className="site-search-btn">Buscar</button>
            </div>
          </form>
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
            <button className="btn btn-sm btn-logout" onClick={sair} type="button">Sair</button>
          </div>
        </div>
      </nav>
    </header>
  );
}
