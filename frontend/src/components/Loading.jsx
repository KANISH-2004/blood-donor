export default function Loading({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-inkSoft">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-crimson" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
