export default function Modal({ aberto, titulo, onClose, children }) {
  if (!aberto) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-card modal-slide-in" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal-header">
          <h3>{titulo}</h3>
          <button type="button" className="modal-close" onClick={onClose}>Fechar</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
