import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import LoadingBlock from '../components/LoadingBlock.jsx';

export default function Servicos() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        setLista(await api.getServicos());
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Serviços</h1>
          <p className="page-subtitle">Acesso rápido aos módulos disponíveis no sistema.</p>
        </div>
      </div>
      {erro && <div className="alerta alerta-erro">{erro}</div>}
      {carregando ? <LoadingBlock texto="Carregando serviços..." /> : (
        <div className="service-grid">
          {lista.map(item => (
            <div key={item.id} className="service-card">
              <h3>{item.titulo}</h3>
              <p>{item.descricao}</p>
              <Link className="btn btn-primary" to={item.rota}>Abrir serviço</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
