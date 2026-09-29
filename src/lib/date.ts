import { format, parseISO } from "date-fns";

export function todayKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function dateKeyOf(iso: string): string {
  return format(parseISO(iso), "yyyy-MM-dd");
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function formatDateKeyLong(dateKey: string): string {
  try {
    return format(parseISO(dateKey), "d MMMM yyyy");
  } catch {
    return dateKey;
  }
}

export function formatDateKeyShort(dateKey: string): string {
  try {
    return format(parseISO(dateKey), "d MMM yyyy");
  } catch {
    return dateKey;
  }
}

export function formatTime(iso: string): string {
  try {
    return format(parseISO(iso), "h:mm a");
  } catch {
    return "";
  }
}

export function formatDateTimeLong(iso: string): string {
  try {
    return format(parseISO(iso), "d MMMM yyyy, h:mm a");
  } catch {
    return iso;
  }
}
