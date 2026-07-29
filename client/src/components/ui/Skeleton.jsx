export default function Skeleton({ w = '100%', h = 12, r, style }) {
  return (
    <div
      className="skeleton"
      style={{ width: w, height: h, ...(r != null ? { borderRadius: r } : null), ...style }}
      aria-hidden="true"
    />
  );
}
