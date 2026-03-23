export default function Pagination({ currentPage, totalItems, pageSize = 10, onChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalPages <= 1) return null;

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const pages = [];
  for (let page = start; page <= end; page += 1) pages.push(page);

  return (
    <div className="pagination-wrap">
      <div className="pagination-status">
        Pagina {currentPage} de {totalPages} • {totalItems} registros
      </div>
      <div className="pagination-actions">
        <button
          className="btn btn-secondary btn-sm"
          type="button"
          disabled={currentPage === 1}
          onClick={() => onChange(currentPage - 1)}
        >
          Anterior
        </button>

        {pages.map(page => (
          <button
            key={page}
            className={`btn btn-sm pagination-btn ${page === currentPage ? 'active' : ''}`}
            type="button"
            onClick={() => onChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="btn btn-secondary btn-sm"
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onChange(currentPage + 1)}
        >
          Proxima
        </button>
      </div>
    </div>
  );
}
