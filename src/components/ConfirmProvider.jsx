import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog.jsx";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const close = useCallback((value) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setDialog(null);
  }, []);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      if (resolverRef.current) resolverRef.current(false);
      resolverRef.current = resolve;
      setDialog({
        title: options.title || "¿Confirmar?",
        text: options.text || "",
        confirmLabel: options.confirmLabel || "Confirmar",
        continueLabel: options.continueLabel || "Continuar",
        cancelLabel: options.cancelLabel || "Cancelar",
        danger: options.danger !== false,
        steps: Math.max(1, options.steps || 1),
        step: 1,
      });
    });
  }, []);

  useEffect(() => {
    if (!dialog) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog ? (
        <ConfirmDialog
          title={dialog.title}
          text={dialog.text}
          step={dialog.step}
          steps={dialog.steps}
          confirmLabel={dialog.confirmLabel}
          continueLabel={dialog.continueLabel}
          cancelLabel={dialog.cancelLabel}
          danger={dialog.danger}
          onCancel={() => close(false)}
          onContinue={() => setDialog((prev) => (prev ? { ...prev, step: prev.step + 1 } : prev))}
          onConfirm={() => close(true)}
        />
      ) : null}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    return (options = {}) =>
      Promise.resolve(
        window.confirm([options.title, options.text].filter(Boolean).join("\n\n"))
      );
  }
  return ctx;
}
