// Dates in Ghana time (GMT all year), written the way the designs do:
// "Tue 29 Sep, 6:39 PM" and "29 Sep 2026". Built by hand because en-GB now
// prints "Sept" and a lowercase "pm".

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatGhanaDate(input: Date | string): string {
  const d = new Date(input);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatGhanaDateTime(input: Date | string): string {
  const d = new Date(input);
  const hours = d.getUTCHours();
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}, ${h12}:${minutes} ${hours < 12 ? "AM" : "PM"}`;
}
