import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import LoadingBlock from '../components/LoadingBlock.jsx';
import Modal from '../components/Modal.jsx';
import toast from 'react-hot-toast';
import { Search, User, FileText, ClipboardList, Eye } from 'lucide-react';

export default function Busca() {
  const [params] = useSearchParams();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [selecionado, setSelecionado] = useState(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      try {
        const resposta = await api.buscar({
          q: params.get('q') || '',
          startDate: params.get('startDate') || '',
          endDate: params.get('endDate') || ''
        });
        setDados(resposta);
      } catch (e) {
        toast.error('Erro na busca: ' + e.message);
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

      {carregando ? (
        <LoadingBlock texto="Buscando registros..." />
      ) : !dados ? null : (
        <>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-card-icon" style={{background: '#f1f5f9'}}><Search size={20} /></div>
              <div>
                <strong>{dados.resumo.total}</strong>
                <span>Total</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-card-icon" style={{background: '#f1f5f9'}}><User size={20} /></div>
              <div>
                <strong>{dados.resumo.pessoas}</strong>
                 <span>Pessoas</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-card-icon" style={{background: '#f1f5f9'}}><FileText size={20} /></div>
              <div>
                <strong>{dados.resumo.documentos}</strong>
                <span>Documentos</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-card-icon" style={{background: '#f1f5f9'}}><ClipboardList size={20} /></div>
              <div>
                <strong>{dados.resumo.protocolos}</strong>
                <span>Protocolos</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title"><User size={18} /> Pessoas</h2>
            {dados.pessoas.length === 0 ? <p className="vazio">Nenhuma pessoa encontrada.</p> : (
              <div className="simple-list">
                {dados.pessoas.map(item => (
                  <button key={`p-${item.id}`} className="result-item" onClick={() => setSelecionado({ tipo: 'Pessoa', dados: item })}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                       <div>
                          <strong>{item.nome}</strong>
                          <span style={{fontSize: '0.8rem', opacity: 0.7}}>{item.cpf} {item.email ? `• ${item.email}` : ''}</span>
                       </div>
                       <Eye size={16} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="card-title"><FileText size={18} /> Documentos</h2>
            {dados.documentos.length === 0 ? <p className="vazio">Nenhum documento encontrado.</p> : (
              <div className="simple-list">
                {dados.documentos.map(item => (
                  <button key={`d-${item.id}`} className="result-item" onClick={() => setSelecionado({ tipo: 'Documento', dados: item })}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                       <div>
                          <strong>{item.titulo}</strong>
                          <span style={{fontSize: '0.8rem', opacity: 0.7}}>{item.tipo} {item.descricao ? `• ${item.descricao}` : ''}</span>
                       </div>
                       <Eye size={16} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="card-title"><ClipboardList size={18} /> Protocolos</h2>
            {dados.protocolos.length === 0 ? <p className="vazio">Nenhum protocolo encontrado.</p> : (
              <div className="simple-list">
                {dados.protocolos.map(item => (
                  <button key={`t-${item.id}`} className="result-item" onClick={() => setSelecionado({ tipo: 'Protocolo', dados: item })}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                       <div>
                          <strong>{item.numero}</strong>
                          <span style={{fontSize: '0.8rem', opacity: 0.7}}>{item.titulo} • {item.situacao}</span>
                       </div>
                       <Eye size={16} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <Modal aberto={!!selecionado} titulo={selecionado ? `Detalhes de ${selecionado.tipo}` : ''} onClose={() => setSelecionado(null)}>
        {selecionado && (
          <div className="detail-grid">
             <div style={{background: '#f8fafc', padding: '1rem', borderRadius: '4px', border: '1px solid #d1d5db'}}>
                <pre style={{fontSize: '0.8rem', whiteSpace: 'pre-wrap'}}>{JSON.stringify(selecionado.dados, null, 2)}</pre>
             </div>
             <div className="form-actions" style={{justifyContent: 'flex-end', marginTop: '1rem'}}>
                <button className="btn btn-secondary" onClick={() => setSelecionado(null)}>Fechar</button>
             </div>
          </div>
        )}
      </Modal>

      <footer className="rodape">WPAH © {new Date().getFullYear()} — Busca Unificada</footer>
    </div>
  );
}
