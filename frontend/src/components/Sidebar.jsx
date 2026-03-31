import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  ClipboardList, 
  Users, 
  Briefcase, 
  User, 
  LogOut,
  X,
  ShieldCheck,
  Activity
} from 'lucide-react';

export default function Sidebar({ isOpen, toggle, usuarioJson, sair }) {
  const location = useLocation();
  const usuario = JSON.parse(usuarioJson || '{}');
  const userLogin = String(usuario?.login || '').toLowerCase();
  const userName = String(usuario?.nome || '').toLowerCase();
  
  // REGRA SUPREMA: Apenas o login 'super' oficial tem acesso pleno.
  const isSuper = usuario?.role === 'super' || userLogin === 'super';
  const isAdmin = isSuper || usuario?.role === 'admin' || userLogin === 'admin';

  const ativo = (path) => location.pathname === path ? 'sidebar-item active' : 'sidebar-item';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>Menu Principal</span>
          <button onClick={toggle} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/inicio" className={ativo('/inicio')} onClick={toggle}>
            <Home size={20} /> Início
          </Link>
          <Link to="/documentos" className={ativo('/documentos')} onClick={toggle}>
            <FileText size={20} /> Leis e Documentos
          </Link>
          <Link to="/protocolos" className={ativo('/protocolos')} onClick={toggle}>
            <ClipboardList size={20} /> Protocolos
          </Link>
          <Link to="/servicos" className={ativo('/servicos')} onClick={toggle}>
            <Briefcase size={20} /> Serviços
          </Link>
          <Link to="/pessoas" className={ativo('/pessoas')} onClick={toggle}>
            <Users size={20} /> Pessoas e Cadastros
          </Link>

          <div style={{ padding: '1rem 1.5rem', opacity: 0.4, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Minha Conta
          </div>
          
          <Link to="/perfil" className={ativo('/perfil')} onClick={toggle}>
            <User size={20} /> Meu Perfil
          </Link>

          {isSuper && (
            <>
              <div style={{ padding: '1rem 1.5rem', opacity: 0.4, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sistema (Super User)
              </div>
              <Link to="/saude" className={ativo('/saude')} onClick={toggle}>
                <Activity size={20} /> Saúde do Sistema
              </Link>
              <Link to="/logs" className={ativo('/logs')} onClick={toggle}>
                <ShieldCheck size={20} /> Logs de Auditoria
              </Link>
            </>
          )}

          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <button 
              onClick={() => { sair(); toggle(); }} 
              className="sidebar-item" 
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <LogOut size={20} /> Sair da Conta
            </button>
          </div>
        </nav>
    </aside>
  );
}
