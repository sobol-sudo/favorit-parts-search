export default function ErrorAlert({ message, onRetry }) {
  return (
    <div
      className="alert alert-warning d-flex flex-wrap justify-content-between align-items-center gap-2"
      role="alert"
    >
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-outline-dark flex-shrink-0" onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  )
}
