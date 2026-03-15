import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import HeroBanner from './components/HeroBanner.jsx';
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import Pessoas from './pages/Pessoas.jsx';
import Documentos from './pages/Documentos.jsx';
import Protocolos from './pages/Protocolos.jsx';
import Busca from './pages/Busca.jsx';
import Perfil from './pages/Perfil.jsx';
import Servicos from './pages/Servicos.jsx';
import Transparencia from './pages/Transparencia.jsx';

function Layout({ children }) {
  const usuario = localStorage.getItem('usuario');
  if (!usuario) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      <HeroBanner />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/" element={<Layout><Navigate to="/pessoas" replace /></Layout>} />
        <Route path="/pessoas"    element={<Layout><Pessoas /></Layout>} />
        <Route path="/documentos" element={<Layout><Documentos /></Layout>} />
        <Route path="/protocolos" element={<Layout><Protocolos /></Layout>} />
        <Route path="/busca" element={<Layout><Busca /></Layout>} />
        <Route path="/perfil" element={<Layout><Perfil /></Layout>} />
        <Route path="/servicos" element={<Layout><Servicos /></Layout>} />
        <Route path="/transparencia" element={<Layout><Transparencia /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
