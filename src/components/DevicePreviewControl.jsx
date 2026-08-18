import {
  IconDevicePhone,
  IconDeviceTablet,
  IconDeviceMonitor,
} from "./icons.jsx";

const DEVICE_PREVIEW_OPTIONS = [
  { id: "mobile", label: "Vista móvil (375px)", Icon: IconDevicePhone },
  { id: "tablet", label: "Vista tablet (768px)", Icon: IconDeviceTablet },
  { id: "desktop", label: "Vista PC (1200px)", Icon: IconDeviceMonitor },
];

export function DevicePreviewControl({ mode, onChange }) {
  return (
    <div className="device-preview-control" role="group" aria-label="Previsualización de dispositivo">
      {DEVICE_PREVIEW_OPTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`device-preview-control__btn${mode === id ? " device-preview-control__btn--active" : ""}`}
          aria-label={label}
          aria-pressed={mode === id}
          title={label}
          onClick={() => onChange(id)}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
