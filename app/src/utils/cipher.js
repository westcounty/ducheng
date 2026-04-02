/**
 * Caesar cipher utilities and answer checking
 */

/**
 * Encrypt A-Z letters using Caesar cipher; non-alphabetic characters pass through unchanged.
 * @param {string} text
 * @param {number} shift
 * @returns {string}
 */
export function caesarEncrypt(text, shift) {
  const n = ((shift % 26) + 26) % 26
  return text.replace(/[A-Za-z]/g, (char) => {
    const base = char >= 'a' ? 97 : 65
    return String.fromCharCode(((char.charCodeAt(0) - base + n) % 26) + base)
  })
}

/**
 * Decrypt A-Z letters using Caesar cipher; non-alphabetic characters pass through unchanged.
 * @param {string} text
 * @param {number} shift
 * @returns {string}
 */
export function caesarDecrypt(text, shift) {
  return caesarEncrypt(text, -shift)
}

/**
 * Normalize a string for comparison: trim whitespace, lowercase, remove all spaces.
 * @param {string} str
 * @returns {string}
 */
function normalize(str) {
  return str.trim().toLowerCase().replace(/\s+/g, '')
}

/**
 * Check whether a player's input matches the expected answer.
 * Comparison is case-insensitive, whitespace-insensitive.
 * @param {string} input - Raw player input
 * @param {string} expected - Correct answer
 * @returns {boolean}
 */
export function checkAnswer(input, expected) {
  return normalize(input) === normalize(expected)
}
