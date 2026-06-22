// Pure-CSS research vial graphic. Presentational only.

export function Vial({ label }: { label: string }) {
  return (
    <span className="product-vial" aria-hidden="true">
      <span className="vial-cap" />
      <span className="vial-glass">
        <span className="vial-label">{label}</span>
        <span className="vial-liquid" />
        <span className="vial-shine" />
      </span>
    </span>
  );
}

// Derive a short, readable label for the vial (e.g. "RT", "GHK").
export function vialLabel(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9+ -]/g, "");
  const letters = cleaned.replace(/[^A-Za-z]/g, "");
  return (letters.slice(0, 3) || cleaned.slice(0, 3)).toUpperCase();
}
