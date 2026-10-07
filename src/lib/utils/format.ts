import { format, parseISO } from "date-fns";

export function formatDate(value: string, pattern = "MMM d, yyyy"): string {
  try {
    return format(parseISO(value), pattern);
  } catch {
    return value;
  }
}

export function formatDateTime(value: string): string {
  return formatDate(value, "MMM d, yyyy · h:mm a");
}

export function formatPatientName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}
