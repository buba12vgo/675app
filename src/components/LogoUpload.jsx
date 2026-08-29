import { useRef } from "react";
import { EntityLogoMark } from "./EntityLogoMark.jsx";

export function LogoUpload({
  title,
  subtitle,
  logoUrl,
  entityName,
  uploading,
  canEdit,
  onUpload,
  onRemove,
  compact = false,
  accent: _accent,
  onAccent: _onAccent,
  text,
  textSecondary,
  textMuted,
  inputBorder,
  inputBg,
  accentLight,
  accentSoft,
  accentBorder,
  markSize = 56,
}) {
  const inputRef = useRef(null);

  if (!canEdit && !logoUrl) return null;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
    event.target.value = "";
  };

  return (
    <div className={`club-logo-upload${compact ? " club-logo-upload--compact" : ""}`}>
      <EntityLogoMark
        logoUrl={logoUrl}
        nombre={entityName}
        accentLight={accentLight}
        accentSoft={accentSoft}
        accentBorder={accentBorder}
        className={`club-logo-upload__preview${compact ? "" : " team-context-logo"}`}
        size={markSize}
      />
      <div className="club-logo-upload__body">
        <div className="club-logo-upload__title" style={{ color: text }}>
          {title}
        </div>
        {subtitle && (
          <div className="club-logo-upload__subtitle" style={{ color: textSecondary }}>
            {subtitle}
          </div>
        )}
        {canEdit && (
          <>
            <div className="club-logo-upload__actions">
              <button
                type="button"
                className="club-logo-upload__btn"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                {uploading ? "Subiendo…" : logoUrl ? "Cambiar escudo" : "Subir escudo"}
              </button>
              {logoUrl && (
                <button
                  type="button"
                  className="club-logo-upload__btn club-logo-upload__btn--ghost"
                  style={{ background: inputBg, color: textMuted, borderColor: inputBorder }}
                  disabled={uploading}
                  onClick={onRemove}
                >
                  Quitar
                </button>
              )}
            </div>
            <div className="club-logo-upload__hint" style={{ color: textMuted }}>
              PNG, JPG o WEBP · máx. 2 MB · se guarda en Firestore
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              hidden
              onChange={handleFileChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
