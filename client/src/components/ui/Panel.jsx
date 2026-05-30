export default function Panel({ title, titleRight, titleAction, children, style, delay }) {
  return (
    <div
      className="panel fade-in"
      style={{ animationDelay: delay ? `${delay}s` : undefined, ...style }}
    >
      {title && (
        <div className="panel-title">
          <span>{title}</span>
          {titleRight && (
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{titleRight}</span>
          )}
          {titleAction}
        </div>
      )}
      {children}
    </div>
  );
}
