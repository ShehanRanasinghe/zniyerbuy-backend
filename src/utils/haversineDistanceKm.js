// Computes the great-circle distance between two lat/lng points, in
// kilometers, using the haversine formula.
//
// Why this exists as a shared util: shops.service.js's getNearbyShops
// computes distance via a raw SQL expression appended to a Supabase
// .select() string, which only works there because latitude/longitude are
// columns directly on the 'shops' table being queried. Products don't have
// their own lat/lng — only their shop does — so distance has to be
// computed in JavaScript after joining in the shop's coordinates. This
// util is shared by product.controller.js's searchProducts and
// getNearbyProducts so the math lives in one place.
//
// Returns null (rather than throwing/NaN) if any coordinate is missing or
// not a valid number, so callers can simply treat "no distance" as "put
// this at the end of the sorted list" instead of special-casing errors.
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const coords = [lat1, lon1, lat2, lon2].map(Number);
  if (coords.some((v) => Number.isNaN(v) || v === null)) {
    return null;
  }

  const [a1, o1, a2, o2] = coords;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth's mean radius in km

  const dLat = toRad(a2 - a1);
  const dLon = toRad(o2 - o1);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);

  const h =
    sinLat * sinLat +
    Math.cos(toRad(a1)) * Math.cos(toRad(a2)) * sinLon * sinLon;

  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

module.exports = haversineDistanceKm;