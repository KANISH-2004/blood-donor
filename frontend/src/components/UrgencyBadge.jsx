const STYLES = {
  critical: "bg-crimson-soft text-crimson-deep",
  urgent: "bg-amber-soft text-amber",
  scheduled: "bg-pulse-soft text-pulse-deep",
};

export default function UrgencyBadge({ level }) {
  return <span className={`badge ${STYLES[level] || "bg-line text-inkSoft"}`}>{level}</span>;
}
