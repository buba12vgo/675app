import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CURRENT_SUITE_APP, SUITE_APPS } from "../lib/suiteApps.js";
import { IconApps } from "./icons.jsx";

const LOGO_SRC = "/logo-675.png";

export function SuiteLauncher() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const update = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(320, window.innerWidth - 16);
      let left = rect.right - width;
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
      setPosition({ top: rect.bottom + 8, left, width });
    };
    update();
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("resize", update);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="suite-launcher">
      <button
        ref={buttonRef}
        type="button"
        className="suite-launcher__btn"
        aria-label="Aplicaciones de la suite"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <IconApps size={18} />
      </button>
      {open && position
        ? createPortal(
            <>
              <button
                type="button"
                className="suite-launcher__backdrop"
                aria-label="Cerrar aplicaciones"
                onClick={() => setOpen(false)}
              />
              <div
                id={panelId}
                role="dialog"
                aria-label="Suite 675"
                className="suite-launcher__panel"
                style={{ top: position.top, left: position.left, width: position.width }}
              >
                {SUITE_APPS.map((app) => {
                  const current = app.id === CURRENT_SUITE_APP;
                  return (
                    <a
                      key={app.id}
                      href={app.href}
                      className={`suite-launcher__app${current ? " is-current" : ""}`}
                      aria-current={current ? "page" : undefined}
                    >
                      <img className="suite-launcher__logo" src={LOGO_SRC} alt="" width={40} height={40} />
                      <span className="suite-launcher__copy">
                        <span className="suite-launcher__name">
                          675 <span>{app.suffix}</span>
                        </span>
                        <span className="suite-launcher__subtitle">{app.subtitle}</span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
