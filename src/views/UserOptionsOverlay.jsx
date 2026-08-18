import { IconChevronLeft } from "../components/icons.jsx";
import { UserOptionsPanel } from "../components/UserOptionsPanel.jsx";

export function UserOptionsOverlay({
  onBack,
  textMuted,
  inputBorder,
  cardBgElevated,
  userOptionsProps,
}) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="user-options-back"
        style={{ color: textMuted, borderColor: inputBorder, background: cardBgElevated }}
      >
        <IconChevronLeft size={16} color={textMuted} />
        <span>Volver</span>
      </button>
      <UserOptionsPanel {...userOptionsProps} />
    </>
  );
}
