export default function SectionLabel({ children, count }) {
  return (
    <div className="section-label">
      {children}
      {count !== undefined && <span className="section-count">{count}</span>}
    </div>
  );
}
