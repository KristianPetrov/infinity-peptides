"use client";

import { useEffect, useState } from "react";

// Current-time reads aren't allowed during prerender under Cache Components,
// so render a stable baseline year and correct it after hydration.
export function CopyrightYear() {
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <>{year}</>;
}
