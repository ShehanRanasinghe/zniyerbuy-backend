// Generates order numbers in the format: ORD-{YYYY}-{DDMMYYYYHHMMSS}
// Example: ORD-2026-19072026121134
//   -> year 2026, then day=19, month=07, year=2026, hour=12, min=11, sec=34
//
// Note: there is no order-creation endpoint in this backend yet (orders
// appear to be created elsewhere, e.g. a customer-facing app not included
// in this repo). This utility is provided so that whichever code ends up
// creating orders can generate IDs in the requested format — see its use
// in the demo seeder for a concrete example.

const pad = (num, length = 2) => String(num).padStart(length, '0');

function generateOrderNumber(date = new Date()) {
  const year = date.getFullYear();
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `ORD-${year}-${day}${month}${year}${hours}${minutes}${seconds}`;
}

module.exports = generateOrderNumber;