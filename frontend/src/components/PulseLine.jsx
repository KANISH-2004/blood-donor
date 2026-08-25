// Signature motif: an animated ECG/pulse line used as a section divider.
// Kept subtle and respects prefers-reduced-motion via CSS.
export default function PulseLine({ color = "#C1272D", className = "" }) {
  const segment =
    "M0,20 L60,20 L75,20 L85,5 L95,35 L105,20 L120,20 L135,20 L145,10 L155,30 L165,20 L400,20";
  return (
    <div className={`pulse-line ${className}`} aria-hidden="true">
      <svg viewBox="0 0 800 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d={segment} fill="none" stroke={color} strokeWidth="2" />
        <path d={segment} transform="translate(400,0)" fill="none" stroke={color} strokeWidth="2" />
      </svg>
    </div>
  );
}
