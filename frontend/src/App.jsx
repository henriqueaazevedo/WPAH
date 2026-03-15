import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import HeroBanner from './components/HeroBanner.jsx';
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import Pessoas from './pages/Pessoas.jsx';
import Documentos from './pages/Documentos.jsx';

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
