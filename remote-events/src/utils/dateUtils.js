export function formatEventDate(dateValue) {
  if (!dateValue) return 'No date';
  const parsed = new Date(Number(dateValue));
  if (isNaN(parsed.getTime())) return 'Invalid Date';
  return parsed.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
