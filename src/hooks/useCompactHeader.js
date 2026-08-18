import { useState, useEffect } from "react";

export function useCompactHeader() {
  const [compact, setCompact] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const handleChange = (event) => setCompact(event.matches);
    media.addEventListener("change", handleChange);
    setCompact(media.matches);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return compact;
}
