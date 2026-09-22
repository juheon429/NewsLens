export function ageInHours(date: Date, now = new Date()) {
  return Math.max(0, (now.getTime() - date.getTime()) / (60 * 60 * 1000));
}

export function formatPublishedLabel(date: Date, now = new Date()) {
  const milliseconds = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(milliseconds / 60_000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}
