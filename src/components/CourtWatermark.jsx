export function CourtWatermark({ className = "court-watermark" }) {
  return (
    <svg className={className} viewBox="0 0 390 844" fill="none" aria-hidden="true">
      <circle cx="195" cy="0" r="140" stroke="currentColor" strokeDasharray="6 6" strokeWidth="1.2" />
      <circle cx="195" cy="0" r="60" stroke="currentColor" strokeWidth="1.2" />
      <line x1="195" x2="195" y1="0" y2="844" stroke="currentColor" strokeDasharray="4 8" strokeOpacity="0.35" strokeWidth="0.75" />
      <path d="M 30 844 L 30 680 A 165 165 0 0 1 360 680 L 360 844" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" />
      <rect height="184" width="130" x="130" y="660" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" />
      <circle cx="195" cy="660" r="65" stroke="currentColor" strokeDasharray="5 5" strokeOpacity="0.4" strokeWidth="1.2" />
    </svg>
  );
}
