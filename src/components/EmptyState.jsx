export function EmptyState({ title, hint, className = "" }) {
  return (
    <div className={`empty-state ${className}`.trim()} role="status">
      {title ? <p className="empty-state__title">{title}</p> : null}
      {hint ? <p className="empty-state__hint">{hint}</p> : null}
    </div>
  );
}
