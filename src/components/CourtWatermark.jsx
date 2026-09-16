function PortraitCourt() {
  return (
    <>
      <circle cx="195" cy="0" r="140" stroke="currentColor" strokeDasharray="6 6" strokeWidth="1.2" />
      <circle cx="195" cy="0" r="60" stroke="currentColor" strokeWidth="1.2" />
      <line x1="195" x2="195" y1="0" y2="844" stroke="currentColor" strokeDasharray="4 8" strokeOpacity="0.35" strokeWidth="0.75" />
      <path d="M 30 844 L 30 680 A 165 165 0 0 1 360 680 L 360 844" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" />
      <rect height="184" width="130" x="130" y="660" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" />
      <circle cx="195" cy="660" r="65" stroke="currentColor" strokeDasharray="5 5" strokeOpacity="0.4" strokeWidth="1.2" />
    </>
  );
}

function LandscapeCourt() {
  return (
    <>
      <rect x="40" y="40" width="920" height="520" rx="8" strokeDasharray="4 6" strokeOpacity="0.3" />
      <line x1="500" y1="40" x2="500" y2="560" strokeOpacity="0.4" />
      <circle cx="500" cy="300" r="100" strokeOpacity="0.4" />
      <circle cx="500" cy="300" r="18" fill="currentColor" fillOpacity="0.08" />
      <path d="M 40 110 L 160 110 A 210 210 0 0 1 160 490 L 40 490" strokeOpacity="0.5" />
      <path d="M 960 110 L 840 110 A 210 210 0 0 0 840 490 L 960 490" strokeOpacity="0.3" />
      <rect x="40" y="210" width="180" height="180" strokeOpacity="0.4" />
      <circle cx="220" cy="300" r="60" strokeOpacity="0.4" />
      <circle cx="220" cy="300" r="60" strokeDasharray="6 6" strokeOpacity="0.25" />
      <line x1="75" y1="270" x2="75" y2="330" strokeWidth="2.5" strokeOpacity="0.6" />
      <circle cx="85" cy="300" r="15" strokeWidth="1.5" strokeOpacity="0.6" />
      <path d="M 75 260 A 40 40 0 0 1 75 340" strokeOpacity="0.4" />
      <rect x="780" y="210" width="180" height="180" strokeOpacity="0.28" />
      <circle cx="780" cy="300" r="60" strokeOpacity="0.28" />
    </>
  );
}

export function CourtWatermark({ className = "court-watermark", variant = "portrait" }) {
  const landscape = variant === "landscape";
  return (
    <svg
      className={className}
      viewBox={landscape ? "0 0 1000 600" : "0 0 390 844"}
      fill="none"
      preserveAspectRatio={landscape ? "xMidYMid slice" : "xMidYMid meet"}
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden="true"
    >
      {landscape ? <LandscapeCourt /> : <PortraitCourt />}
    </svg>
  );
}
