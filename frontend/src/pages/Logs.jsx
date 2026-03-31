import { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, User, Search, RefreshCw, FileText } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function Logs() {
  const [logs] = useState([
    { id: 1, data: new Date().toISOString(), usuario: 'admin', acao: 'Atualizou Pessoas', detalhe: 'Alteração de dados cadastrais', ip: '189.10.x.x' },
    { id: 2, data: new Date(Date.now() - 3600000).toISOString(), usuario: 'super', acao: 'Acesso à Saúde', detalhe: 'Monitoramento de servidor', ip: '191.2.x.x' },
    { id: 3, data: new Date(Date.now() - 7200000).toISOString(), usuario: 'admin', acao: 'Excluiu Documento', detalhe: 'Protocolo #882 removido', ip: '189.10.x.x' },
  ]);

  const usuarioJson = localStorage.getItem('usuario');
  const usuario = JSON.parse(usuarioJson || '{}');
  const userLogin = String(usuario?.login || '').toLowerCase();
  
  // REGRA SUPREMA: Acesso total apenas para 'super'.
  const isSuper = usuario?.role === 'super' || userLogin === 'super';

  if (!isSuper) {
    return <Navigate to="/inicio" replace />;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title"><ShieldCheck style={{verticalAlign: 'middle', marginRight: '8px'}} /> Logs de Auditoria</h1>
          <p className="page-subtitle">Histórico completo de ações administrativas (Exclusivo Super User).</p>
        </div>
        <button className="btn btn-secondary" onClick={() => window.location.reload()}>
          <RefreshCw size={16} /> Atualizar Logs
        </button>
      </div>

      <div className="card">
         <div className="filter-bar" style={{gridTemplateColumns: '1fr auto auto'}}>
            <input placeholder="Filtrar por usuário ou ação..." />
            <input type="date" />
            <button className="btn btn-primary"><Search size={16} /> Buscar</button>
         </div>
      </div>

      <div className="card">
        <h2 className="card-title">Últimas 50 Atividades</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th><Calendar size={14} /> Data / Hora</th>
                <th><User size={14} /> Usuário</th>
                <th>Ação</th>
                <th>Detalhes</th>
                <th>IP de Origem</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{fontSize: '0.8rem'}}>{new Date(log.data).toLocaleString('pt-BR')}</td>
                  <td><strong>{log.usuario}</strong></td>
                  <td><span className="badge badge-tipo">{log.acao}</span></td>
                  <td style={{fontSize: '0.85rem'}}>{log.detalhe}</td>
                  <td className="muted">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="rodape">WPAH Audit Trail — Histórico Imutável Centralizado</footer>
    </div>
  );
}
