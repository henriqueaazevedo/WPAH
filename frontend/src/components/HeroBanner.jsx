import { useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

function tituloPorRota(pathname) {
  if (pathname.startsWith('/documentos')) {
    return {
      titulo: 'Consulta de Leis e Documentos',
      descricao: 'Pesquise atos, registros documentais e informacoes administrativas em um unico portal.'
    };
  }

  if (pathname.startsWith('/protocolos')) {
    return {
      titulo: 'Acompanhamento de Protocolos',
      descricao: 'Localize protocolos, acompanhe situacoes e consulte os detalhes do atendimento.'
    };
  }

  if (pathname.startsWith('/transparencia')) {
    return {
      titulo: 'Portal de Transparencia',
      descricao: 'Acesse indicadores, quantitativos e ultimos registros publicados pela plataforma.'
    };
  }

  if (pathname.startsWith('/servicos')) {
    return {
      titulo: 'Servicos Digitais Disponiveis',
      descricao: 'Encontre rapidamente os servicos internos e administrativos disponiveis no sistema.'
    };
  }

  return {
    titulo: 'Bem-vindo ao Portal WPAH',
    descricao: 'Plataforma oficial para gerenciamento de pessoas, documentos e fluxos administrativos de forma centralizada.'
  };
}

export default function HeroBanner() {
  const location = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const conteudo = useMemo(() => tituloPorRota(location.pathname), [location.pathname]);

  function buscar(e) {
    e.preventDefault();
    const query = new URLSearchParams();
    if (q) query.set('q', q);
    if (startDate) query.set('startDate', startDate);
    if (endDate) query.set('endDate', endDate);
    navigate(`/busca?${query.toString()}`);
  }

  return (
    <section className="hero-wrap">
      <div className="hero-banner">
        <div className="hero-overlay">
          <h1>{conteudo.titulo}</h1>
          <p>{conteudo.descricao}</p>
        </div>
      </div>

      <div className="hero-search-card">
        <div className="hero-tabs">
          <button className="hero-tab active" type="button">Estou buscando</button>
          <Link className="hero-tab hero-tab-link" to="/pessoas">Pessoas</Link>
          <Link className="hero-tab hero-tab-link" to="/documentos">Documentos</Link>
          <Link className="hero-tab hero-tab-link" to="/protocolos">Protocolos</Link>
        </div>

        <form className="hero-search-form" onSubmit={buscar}>
          <div className="hero-field">
            <label>Data inicial</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="hero-field">
            <label>Data final</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="hero-field hero-field-wide">
            <label>Termo de busca</label>
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Digite nome, CPF, titulo, numero ou conteudo"
            />
          </div>
          <div className="hero-field hero-field-action">
            <button type="submit" className="btn btn-primary">Buscar</button>
          </div>
        </form>
      </div>
    </section>
  );
}
