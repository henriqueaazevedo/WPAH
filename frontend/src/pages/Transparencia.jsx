import { useEffect, useState } from 'react';
import { api } from '../api.js';
import LoadingBlock from '../components/LoadingBlock.jsx';

export default function Transparencia() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

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

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transparência</h1>
          <p className="page-subtitle">Indicadores consolidados e últimos registros do sistema.</p>
        </div>
      </div>
      {erro && <div className="alerta alerta-erro">{erro}</div>}
      {carregando ? <LoadingBlock texto="Carregando indicadores..." /> : dados && (
        <>
          <div className="summary-grid">
            <div className="summary-card"><strong>{dados.totais.pessoas}</strong><span>Pessoas</span></div>
            <div className="summary-card"><strong>{dados.totais.documentos}</strong><span>Documentos</span></div>
            <div className="summary-card"><strong>{dados.totais.protocolos}</strong><span>Protocolos</span></div>
            <div className="summary-card"><strong>{dados.totais.usuarios}</strong><span>Usuários</span></div>
          </div>
          <div className="card">
            <h2 className="card-title">Últimas pessoas cadastradas</h2>
            <div className="simple-list">{dados.ultimosCadastros.pessoas.map(item => <div className="result-item static-item" key={item.id}><strong>{item.nome}</strong><span>{item.cpf}</span></div>)}</div>
          </div>
          <div className="card">
            <h2 className="card-title">Últimos documentos</h2>
            <div className="simple-list">{dados.ultimosCadastros.documentos.map(item => <div className="result-item static-item" key={item.id}><strong>{item.titulo}</strong><span>{item.tipo}</span></div>)}</div>
          </div>
          <div className="card">
            <h2 className="card-title">Últimos protocolos</h2>
            <div className="simple-list">{dados.ultimosCadastros.protocolos.map(item => <div className="result-item static-item" key={item.id}><strong>{item.numero}</strong><span>{item.titulo}</span></div>)}</div>
          </div>
        </>
      )}
    </div>
  );
}
