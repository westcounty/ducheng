/**
 * Arrival verification using Haversine distance formula.
 * Compares user GPS coordinates against target location.
 */

const EARTH_RADIUS_METERS = 6_371_000

/**
 * Calculate the Haversine distance between two GPS points.
 * @param {number} lat1 - User latitude (degrees)
 * @param {number} lng1 - User longitude (degrees)
 * @param {number} lat2 - Target latitude (degrees)
 * @param {number} lng2 - Target longitude (degrees)
 * @returns {number} Distance in meters
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_METERS * c
}

/**
 * Verify that user GPS is within radius of the target location.
 *
 * @param {{ gpsLat: number, gpsLng: number }} submission - User's GPS coordinates
 * @param {{ lat: number, lng: number, radius_meters: number }} validationConfig - Target config
 * @returns {{ passed: boolean, distance: number, radius: number }}
 */
export function verifyArrival(submission, validationConfig) {
  const userLat = parseFloat(submission.gpsLat)
  const userLng = parseFloat(submission.gpsLng)
  const targetLat = parseFloat(validationConfig.lat)
  const targetLng = parseFloat(validationConfig.lng)
  const radius = validationConfig.radius_meters || 50

  if (isNaN(userLat) || isNaN(userLng)) {
    return { passed: false, distance: null, radius, reason: 'Invalid GPS coordinates' }
  }

  if (isNaN(targetLat) || isNaN(targetLng)) {
    // Config error — let user through (graceful degradation)
    return { passed: true, distance: 0, radius, reason: 'Target GPS not configured' }
  }

  const distance = Math.round(haversineDistance(userLat, userLng, targetLat, targetLng))

  return {
    passed: distance <= radius,
    distance,
    radius,
    reason: distance <= radius
      ? `Within range (${distance}m / ${radius}m)`
      : `Too far (${distance}m, need ≤${radius}m)`,
  }
}
