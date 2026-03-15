import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  function sair() {
    localStorage.removeItem('usuario');
    navigate('/login');
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
          <div className="site-tools">
            <select aria-label="Idioma" className="site-lang-select">
              <option>Selecionar idioma</option>
              <option>Portugues</option>
              <option>English</option>
            </select>
            <div className="site-search">
              <input type="text" placeholder="Buscar" aria-label="Buscar" />
              <button type="button" className="site-search-btn">Buscar</button>
            </div>
          </div>
        </div>
      </div>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-nav">
            <Link to="/pessoas" className={ativo('/pessoas')}>Pessoas e Cadastros</Link>
            <Link to="/documentos" className={ativo('/documentos')}>Leis e Documentos</Link>
            <span className="navbar-link fake-link">Servicos</span>
            <span className="navbar-link fake-link">Transparencia</span>
          </div>
          <div className="navbar-usuario">
            <span className="navbar-tag">{usuario.nome || 'Usuario'}</span>
            <button className="btn btn-sm btn-logout" onClick={sair}>Sair</button>
          </div>
        </div>
      </nav>
    </header>
  );
}
