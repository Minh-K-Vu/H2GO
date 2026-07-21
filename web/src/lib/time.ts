export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) {
    return "No data yet";
  }

  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatShortDateTime(value: string | Date | null | undefined) {
  if (!value) {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function formatDistanceToNow(value: string | Date | null | undefined) {
  if (!value) {
    return "No recent events";
  }

  const date = value instanceof Date ? value : new Date(value);
  const delta = Date.now() - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (delta < minute) {
    return "just now";
  }

  if (delta < hour) {
    return `${Math.round(delta / minute)}m ago`;
  }

  if (delta < day) {
    return `${Math.round(delta / hour)}h ago`;
  }

  return `${Math.round(delta / day)}d ago`;
}

export function formatTimeOnly(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

