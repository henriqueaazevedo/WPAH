import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import LoadingBlock from '../components/LoadingBlock.jsx';
import Modal from '../components/Modal.jsx';

export default function Busca() {
  const [params] = useSearchParams();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [selecionado, setSelecionado] = useState(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro('');
      try {
        const resposta = await api.buscar({
          q: params.get('q') || '',
          startDate: params.get('startDate') || '',
          endDate: params.get('endDate') || ''
        });
        setDados(resposta);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [params]);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Resultado da Busca</h1>
          <p className="page-subtitle">Consulta unificada em pessoas, documentos e protocolos.</p>
        </div>
      </div>

      {erro && <div className="alerta alerta-erro">{erro}</div>}

      {carregando ? (
        <LoadingBlock texto="Buscando registros..." />
      ) : !dados ? null : (
        <>
          <div className="summary-grid">
            <div className="summary-card"><strong>{dados.resumo.total}</strong><span>Total</span></div>
            <div className="summary-card"><strong>{dados.resumo.pessoas}</strong><span>Pessoas</span></div>
            <div className="summary-card"><strong>{dados.resumo.documentos}</strong><span>Documentos</span></div>
            <div className="summary-card"><strong>{dados.resumo.protocolos}</strong><span>Protocolos</span></div>
          </div>

          <div className="card">
            <h2 className="card-title">Pessoas</h2>
            {dados.pessoas.length === 0 ? <p className="vazio">Nenhuma pessoa encontrada.</p> : (
              <div className="simple-list">
                {dados.pessoas.map(item => (
                  <button key={`p-${item.id}`} className="result-item" onClick={() => setSelecionado({ tipo: 'Pessoa', dados: item })}>
                    <strong>{item.nome}</strong>
                    <span>{item.cpf} {item.email ? `• ${item.email}` : ''}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="card-title">Documentos</h2>
            {dados.documentos.length === 0 ? <p className="vazio">Nenhum documento encontrado.</p> : (
              <div className="simple-list">
                {dados.documentos.map(item => (
                  <button key={`d-${item.id}`} className="result-item" onClick={() => setSelecionado({ tipo: 'Documento', dados: item })}>
                    <strong>{item.titulo}</strong>
                    <span>{item.tipo} {item.descricao ? `• ${item.descricao}` : ''}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="card-title">Protocolos</h2>
            {dados.protocolos.length === 0 ? <p className="vazio">Nenhum protocolo encontrado.</p> : (
              <div className="simple-list">
                {dados.protocolos.map(item => (
                  <button key={`t-${item.id}`} className="result-item" onClick={() => setSelecionado({ tipo: 'Protocolo', dados: item })}>
                    <strong>{item.numero}</strong>
                    <span>{item.titulo} • {item.situacao}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <Modal aberto={!!selecionado} titulo={selecionado ? `Detalhes de ${selecionado.tipo}` : ''} onClose={() => setSelecionado(null)}>
        {selecionado && (
          <pre className="json-view">{JSON.stringify(selecionado.dados, null, 2)}</pre>
        )}
      </Modal>
    </div>
  );
}
