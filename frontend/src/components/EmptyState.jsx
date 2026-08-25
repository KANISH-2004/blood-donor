export default function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {message && <p className="max-w-sm text-sm text-inkSoft">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
