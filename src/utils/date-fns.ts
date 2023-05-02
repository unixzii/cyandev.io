import { format as formatDate } from "date-fns";

export function formatTimestampToHumanReadableDate(timestamp: number): string {
  const date = new Date(timestamp);
  return formatDate(date, "MMM. do yyyy");
}
