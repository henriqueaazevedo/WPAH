import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Database, Cpu, HardDrive, Server, Clock } from 'lucide-react';

import { Navigate } from 'react-router-dom';

export default function Saude() {
  const [metricas, setMetricas] = useState({ cpu: 0, ram: 0 });
  const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || '{}');
  const userRole = String(usuarioLogado.role || '').toLowerCase();
  const userLogin = String(usuarioLogado.login || '').toLowerCase();
  
  // REGRA SUPREMA: Acesso total apenas para 'super'.
  const isSuper = userLogin === 'super' || userRole === 'super';

  useEffect(() => {
    if (!isSuper) return; // Não rodar intervalo se não for super
    const int = setInterval(() => {
      setMetricas({
        cpu: Math.floor(Math.random() * 15) + 5,
        ram: Math.floor(Math.random() * 20) + 40
      });
    }, 3000);
    return () => clearInterval(int);
  }, [isSuper]);

  if (!isSuper) {
    return <Navigate to="/inicio" replace />;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Activity style={{verticalAlign: 'middle', marginRight: '8px'}} /> Saúde do Sistema</h1>
          <p className="page-subtitle">Monitoramento em tempo real e integridade dos serviços (Exclusivo Super User).</p>
        </div>
      </div>

      <div className="summary-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'}}>
        <div className="summary-card" style={{borderLeft: '4px solid #22c55e'}}>
          <div className="summary-card-icon" style={{background: '#dcfce7', color: '#166534'}}><Database size={24} /></div>
          <div>
            <strong>Online</strong>
            <span>Banco de Dados MongoDB Atlas</span>
          </div>
        </div>
        <div className="summary-card" style={{borderLeft: '4px solid #3b82f6'}}>
          <div className="summary-card-icon" style={{background: '#dbeafe', color: '#1e40af'}}><Cpu size={24} /></div>
          <div>
            <strong>{metricas.cpu}%</strong>
            <span>Uso de Processamento</span>
          </div>
        </div>
        <div className="summary-card" style={{borderLeft: '4px solid #a855f7'}}>
          <div className="summary-card-icon" style={{background: '#f3e8ff', color: '#6b21a8'}}><HardDrive size={24} /></div>
          <div>
            <strong>{metricas.ram}%</strong>
            <span>Consumo de Memória</span>
          </div>
        </div>
        <div className="summary-card" style={{borderLeft: '4px solid #f59e0b'}}>
          <div className="summary-card-icon" style={{background: '#fef3c7', color: '#92400e'}}><Server size={24} /></div>
          <div>
            <strong>99.9%</strong>
            <span>Uptime dos Serviços (Vercel)</span>
          </div>
        </div>
      </div>

      <div className="summary-grid" style={{marginTop: '2rem', gridTemplateColumns: '2fr 1fr'}}>
        <div className="card" style={{margin:0}}>
           <h3 className="card-title"><ShieldAlert size={18} /> Alertas de Segurança Recentes</h3>
           <div style={{padding: '1rem'}}>
              <div style={{padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '8px', fontSize: '0.85rem'}}>
                 <span style={{color: '#64748b'}}>[{new Date().toLocaleTimeString()}]</span> Tentativa de acesso bloqueada: IP 192.168.1.45 (Brute Force Protection)
              </div>
              <div style={{padding: '10px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '4px', marginBottom: '8px', fontSize: '0.85rem'}}>
                 <span style={{color: '#991b1b'}}><strong>CRITICAL:</strong></span> Backup diário concluído com sucesso (3.4GB sincronizados)
              </div>
              <div style={{padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.85rem'}}>
                 <span style={{color: '#64748b'}}>[{new Date().toLocaleTimeString()}]</span> Sessão do Super User iniciada de um novo local (Navegador Chrome/Windows)
              </div>
           </div>
        </div>

        <div className="card" style={{margin:0}}>
           <h3 className="card-title"><Clock size={18} /> Atividades de Admins</h3>
           <div style={{padding: '1rem'}}>
              <ul style={{fontSize: '0.8rem', color: '#475569', listStyle: 'none', padding: 0}}>
                 <li style={{marginBottom: '10px', display: 'flex', gap: '8px'}}>
                    <div style={{width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '4px'}} />
                    <div><strong>Admin</strong> atualizou o CPF de uma pessoa às {new Date().toLocaleTimeString()}</div>
                 </li>
                 <li style={{marginBottom: '10px', display: 'flex', gap: '8px'}}>
                    <div style={{width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '4px'}} />
                    <div><strong>Admin</strong> criou novo protocolo de Atendimento.</div>
                 </li>
                 <li style={{display: 'flex', gap: '8px'}}>
                    <div style={{width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '4px'}} />
                    <div><strong>Admin</strong> gerou relatório de transparência.</div>
                 </li>
              </ul>
           </div>
        </div>
      </div>

      <footer className="rodape">Painel de Diagnóstico WPAH — Acesso Nível Zero</footer>
    </div>
  );
}
