const MAP = {
  today:   { label: 'HOY',         cls: 'today'    },
  overdue: { label: 'ATRASADO',    cls: 'overdue'  },
  soon:    { label: 'PRONTO',      cls: 'soon'     },
  future:  { label: 'FUTURO',      cls: 'future'   },
  mastered:{ label: 'AFIANZADO ✓', cls: 'mastered' },
};

export default function StatusTag({ status }) {
  const { label, cls } = MAP[status] || MAP.future;
  return <span className={`status-tag ${cls}`}>{label}</span>;
}
