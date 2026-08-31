import { useEffect, useRef, useState } from "react";
import { IconX } from "./icons.jsx";
import {
  parseEjerciciosLista,
  serializeEjerciciosLista,
  moverEjercicio,
} from "../lib/ejerciciosLista.js";

function autoResize(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.max(el.scrollHeight, 40)}px`;
}

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
  const addRef = useRef(null);
  const itemRefs = useRef([]);

  const displayItems = items.map((item, index) => (index === draftIndex ? draftValue : item));

  useEffect(() => {
    itemRefs.current.forEach((el) => autoResize(el));
    autoResize(addRef.current);
  }, [displayItems, nuevo, readOnly]);

  const commit = (nextItems) => {
    onChange(serializeEjerciciosLista(nextItems));
  };

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
              <div className="ejercicios-lista__main">
                <span className="ejercicios-lista__num" style={{ color: accent }}>
                  {index + 1}
                </span>
                {readOnly ? (
                  <p className="ejercicios-lista__text" style={{ color: text }}>{item}</p>
                ) : (
                  <textarea
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    className="ejercicios-lista__input"
                    value={item}
                    disabled={locked}
                    rows={1}
                    onFocus={() => {
                      setDraftIndex(index);
                      setDraftValue(items[index] || "");
                    }}
                    onChange={(e) => {
                      setDraftValue(e.target.value);
                      autoResize(e.target);
                    }}
                    onBlur={finishDraft}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
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
              </div>
              {!readOnly && (
                <div className="ejercicios-lista__actions">
                  <button
                    type="button"
                    className="ejercicios-lista__text-btn"
                    disabled={locked || index === 0}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => commit(moverEjercicio(items, index, index - 1))}
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    className="ejercicios-lista__text-btn"
                    disabled={locked || index === items.length - 1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => commit(moverEjercicio(items, index, index + 1))}
                  >
                    Bajar
                  </button>
                  <button
                    type="button"
                    className="ejercicios-lista__text-btn ejercicios-lista__text-btn--delete"
                    disabled={locked}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => commit(items.filter((_, i) => i !== index))}
                  >
                    <IconX size={13} />
                    Quitar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      {!readOnly && (
        <div className="ejercicios-lista__add">
          <textarea
            ref={addRef}
            className="ejercicios-lista__input ejercicios-lista__input--add"
            placeholder={placeholder}
            value={nuevo}
            disabled={locked}
            rows={2}
            onChange={(e) => {
              setNuevo(e.target.value);
              autoResize(e.target);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
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
            + Añadir ejercicio
          </button>
        </div>
      )}
    </div>
  );
}
