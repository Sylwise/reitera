export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

export function getFirstName(name) {
  return name ? name.trim().split(/\s+/)[0] : '';
}
