import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import Pessoas from './pages/Pessoas.jsx';
import Documentos from './pages/Documentos.jsx';
import Protocolos from './pages/Protocolos.jsx';
import Busca from './pages/Busca.jsx';
import Perfil from './pages/Perfil.jsx';
import Inicio from './pages/Inicio.jsx';
import Servicos from './pages/Servicos.jsx';
import Saude from './pages/Saude.jsx';
import Logs from './pages/Logs.jsx';
import { Menu } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

function Layout({ children }) {
  const [sideOpen, setSideOpen] = useState(false);
  const [usuarioJson, setUsuarioJson] = useState(localStorage.getItem('usuario'));
  const [carregandoSessao, setCarregandoSessao] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setUsuarioJson(localStorage.getItem('usuario'));
    setCarregandoSessao(true);
    const timer = setTimeout(() => setCarregandoSessao(false), 220);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!usuarioJson) return <Navigate to="/login" replace />;

  const usuario = JSON.parse(usuarioJson || '{}');

  function sair() {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }

  return (
    <>
      <Sidebar 
        isOpen={sideOpen} 
        toggle={() => setSideOpen(!sideOpen)} 
        usuarioJson={usuarioJson} 
        sair={sair}
      />

      <div className="sidebar-rail">
        <button 
          onClick={() => setSideOpen(!sideOpen)} 
          className="rail-menu-btn"
          aria-label={sideOpen ? "Recolher menu" : "Expandir menu"}
        >
          <Menu size={24} />
        </button>
        <div className="rail-divider" />
      </div>

      <main className={`section-shell rail-layout ${sideOpen ? 'sidebar-expanded' : ''}`}>
        <div className="section-content page-transition">{children}</div>
        {carregandoSessao && (
          <div className="section-overlay" aria-live="polite" aria-label="Carregando sessão">
            <span className="mini-loader" />
          </div>
        )}
      </main>
    </>
  );
}

export default function App() {
  const usuarioJson = localStorage.getItem('usuario');
  const usuario = JSON.parse(usuarioJson || '{}');
  const userLogin = String(usuario?.login || '').toLowerCase();
  const userRole = String(usuario?.role || '').toLowerCase();
  
  // REGRA SUPREMA: Acesso total apenas para 'super'.
  const isSuper = userLogin === 'super' || userRole === 'super';

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
            zIndex: 999999
          },
        }} 
      />
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/" element={<Layout><Navigate to="/inicio" replace /></Layout>} />
        <Route path="/inicio" element={<Layout><Inicio /></Layout>} />
        <Route path="/documentos" element={<Layout><Documentos /></Layout>} />
        <Route path="/protocolos" element={<Layout><Protocolos /></Layout>} />
        <Route path="/servicos" element={<Layout><Servicos /></Layout>} />
        <Route path="/pessoas"    element={<Layout><Pessoas /></Layout>} />
        <Route path="/busca" element={<Layout><Busca /></Layout>} />
        <Route path="/perfil" element={<Layout><Perfil /></Layout>} />
        <Route path="/saude" element={isSuper ? <Layout><Saude /></Layout> : <Navigate to="/inicio" />} />
        <Route path="/logs" element={isSuper ? <Layout><Logs /></Layout> : <Navigate to="/inicio" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
