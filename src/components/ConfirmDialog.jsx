export function ConfirmDialog({
  title,
  text,
  step,
  steps,
  confirmLabel,
  continueLabel = "Continuar",
  cancelLabel = "Cancelar",
  danger = true,
  onCancel,
  onContinue,
  onConfirm,
}) {
  const isLastStep = step >= steps;
  const actionLabel = isLastStep ? confirmLabel : continueLabel;
  const heading =
    steps > 1 && step > 1 ? "Última confirmación" : title;
  const body =
    steps > 1 && step > 1
      ? "Esta acción no se puede deshacer. Confirma otra vez para seguir."
      : text;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div
        className={`confirm-dialog${danger ? " confirm-dialog--danger" : ""}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-text"
        onClick={(event) => event.stopPropagation()}
      >
        <div id="confirm-dialog-title" className="confirm-dialog__title">
          {heading}
        </div>
        {body ? (
          <p id="confirm-dialog-text" className="confirm-dialog__text">
            {body}
          </p>
        ) : null}
        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="confirm-dialog__cancel"
            onClick={onCancel}
            autoFocus
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-dialog__confirm${danger && isLastStep ? " confirm-dialog__confirm--solid" : ""}`}
            onClick={isLastStep ? onConfirm : onContinue}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
