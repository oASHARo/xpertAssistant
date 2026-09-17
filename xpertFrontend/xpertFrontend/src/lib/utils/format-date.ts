/**
 * Formats an ISO date string to match the mockup's style: "Nov.20.24 03:30PM".
 * Centralized here so every card/list that shows "Created on..." formats
 * identically — a lone toLocaleDateString() scattered per-component would
 * drift in format over time.
 */
export function formatCardDate(isoString: string): string {
  const date = new Date(isoString);

  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${month}.${day}.${year} ${hours.toString().padStart(2, "0")}:${minutes}${ampm}`;
}