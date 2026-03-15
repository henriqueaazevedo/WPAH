export default function HeroBanner() {
  return (
    <section className="hero-wrap">
      <div className="hero-banner">
        <div className="hero-overlay">
          <h1>Bem-vindo ao Portal WPAH</h1>
          <p>
            Plataforma oficial para gerenciamento de pessoas, documentos e fluxos
            administrativos de forma centralizada.
          </p>
        </div>
      </div>

      <div className="hero-search-card">
        <div className="hero-tabs">
          <button className="hero-tab active" type="button">Estou buscando</button>
          <button className="hero-tab" type="button">Pessoas</button>
          <button className="hero-tab" type="button">Documentos</button>
          <button className="hero-tab" type="button">Protocolos</button>
        </div>

        <div className="hero-search-form">
          <div className="hero-field">
            <label>Periodo</label>
            <select>
              <option>2025-26</option>
              <option>2024-25</option>
            </select>
          </div>
          <div className="hero-field">
            <label>Pesquisar por</label>
            <div className="hero-radio-row">
              <label><input type="radio" name="modoBusca" defaultChecked /> Nome</label>
              <label><input type="radio" name="modoBusca" /> Numero</label>
            </div>
          </div>
          <div className="hero-field hero-field-wide">
            <label>Termo de busca</label>
            <input type="text" placeholder="Digite nome, CPF, titulo ou numero" />
          </div>
          <div className="hero-field hero-field-action">
            <button type="button" className="btn btn-primary">Buscar</button>
          </div>
        </div>
      </div>
    </section>
  );
}
