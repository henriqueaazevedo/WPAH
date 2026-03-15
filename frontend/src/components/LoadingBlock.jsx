export default function LoadingBlock({ texto = 'Carregando...' }) {
  return (
    <div className="loading-block">
      <span className="spinner dark" />
      <span>{texto}</span>
    </div>
  );
}
