import { format, formatDistanceToNow, formatRelative, isToday, isYesterday } from "date-fns";

/**
 * Date formatting utilities using date-fns
 */

/**
 * Format date to relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format date to human-readable string
 */
export function formatDate(date: Date | string, formatStr: string = "PPp"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format date to short relative format (e.g., "Today", "Yesterday", "2 days ago")
 */
export function formatShortRelative(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isToday(dateObj)) {
    return format(dateObj, "h:mm a");
  }

  if (isYesterday(dateObj)) {
    return "Yesterday";
  }

  return formatRelative(dateObj, new Date());
}

/**
 * Format date to ISO string
 */
export function formatISO(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Parse date from various formats
 */
export function parseDate(date: Date | string | number): Date {
  if (date instanceof Date) {
    return date;
  }
  if (typeof date === "number") {
    return new Date(date);
  }
  return new Date(date);
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj > new Date();
}

