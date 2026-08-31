import { useState } from "react";
import { IconX } from "./icons.jsx";
import {
  parseEjerciciosLista,
  serializeEjerciciosLista,
  moverEjercicio,
} from "../lib/ejerciciosLista.js";

export function EjerciciosListaEditor({
  value,
  onChange,
  readOnly = false,
  disabled = false,
  placeholder = "Nombre del ejercicio",
  emptyHint = "Aún no hay ejercicios. Añade el primero.",
  accent,
  inputBorder,
  inputBg,
  cardBgElevated,
  text,
  textMuted,
}) {
  const items = parseEjerciciosLista(value);
  const [nuevo, setNuevo] = useState("");
  const [draftIndex, setDraftIndex] = useState(null);
  const [draftValue, setDraftValue] = useState("");
  const locked = readOnly || disabled;

  const commit = (nextItems) => {
    onChange(serializeEjerciciosLista(nextItems));
  };

  const displayItems = items.map((item, index) => (index === draftIndex ? draftValue : item));

  const addItem = () => {
    const trimmed = nuevo.trim();
    if (!trimmed || locked) return;
    commit([...items, trimmed]);
    setNuevo("");
  };

  const finishDraft = () => {
    if (draftIndex === null) return;
    const trimmed = draftValue.trim();
    const next = [...items];
    if (!trimmed) next.splice(draftIndex, 1);
    else next[draftIndex] = trimmed;
    commit(next);
    setDraftIndex(null);
    setDraftValue("");
  };

  return (
    <div className="ejercicios-lista">
      {displayItems.length === 0 ? (
        <p className="ejercicios-lista__empty" style={{ color: textMuted }}>
          {readOnly ? "No hay ejercicios en esta sesión." : emptyHint}
        </p>
      ) : (
        <ol className="ejercicios-lista__ol">
          {displayItems.map((item, index) => (
            <li
              key={index}
              className="ejercicios-lista__item"
              style={{ borderColor: inputBorder, background: cardBgElevated }}
            >
              <span className="ejercicios-lista__num" style={{ color: accent }}>
                {index + 1}
              </span>
              {readOnly ? (
                <span className="ejercicios-lista__text" style={{ color: text }}>{item}</span>
              ) : (
                <input
                  type="text"
                  className="ejercicios-lista__input"
                  value={item}
                  disabled={locked}
                  onFocus={() => {
                    setDraftIndex(index);
                    setDraftValue(items[index] || "");
                  }}
                  onChange={(e) => setDraftValue(e.target.value)}
                  onBlur={finishDraft}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                  style={{
                    color: text,
                    borderColor: inputBorder,
                    background: inputBg,
                  }}
                  aria-label={`Ejercicio ${index + 1}`}
                />
              )}
              {!readOnly && (
                <div className="ejercicios-lista__actions">
                  <button
                    type="button"
                    className="ejercicios-lista__icon-btn"
                    disabled={locked || index === 0}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => commit(moverEjercicio(items, index, index - 1))}
                    aria-label="Subir ejercicio"
                    title="Subir"
                    style={{ color: textMuted, borderColor: inputBorder }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="ejercicios-lista__icon-btn"
                    disabled={locked || index === items.length - 1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => commit(moverEjercicio(items, index, index + 1))}
                    aria-label="Bajar ejercicio"
                    title="Bajar"
                    style={{ color: textMuted, borderColor: inputBorder }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="ejercicios-lista__icon-btn ejercicios-lista__icon-btn--delete"
                    disabled={locked}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => commit(items.filter((_, i) => i !== index))}
                    aria-label="Quitar ejercicio"
                    title="Quitar"
                    style={{ color: "var(--color-error, #DC2626)", borderColor: inputBorder }}
                  >
                    <IconX size={14} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      {!readOnly && (
        <div className="ejercicios-lista__add">
          <input
            type="text"
            className="ejercicios-lista__input ejercicios-lista__input--add"
            placeholder={placeholder}
            value={nuevo}
            disabled={locked}
            onChange={(e) => setNuevo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
            style={{
              color: text,
              borderColor: inputBorder,
              background: cardBgElevated,
            }}
            aria-label="Nuevo ejercicio"
          />
          <button
            type="button"
            className="ejercicios-lista__add-btn"
            onClick={addItem}
            disabled={locked || !nuevo.trim()}
            style={{ background: accent }}
          >
            + Añadir
          </button>
        </div>
      )}
    </div>
  );
}
