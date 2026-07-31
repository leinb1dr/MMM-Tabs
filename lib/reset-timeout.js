/**
 * Resolve the idle reset timeout in milliseconds.
 *
 * - `false` / `null` / non-positive / non-finite → disabled (0)
 * - `undefined` → defaultMs (typically 60000)
 * - positive number → that many milliseconds
 *
 * @param {unknown} value
 * @param {number} [defaultMs=60000]
 * @returns {number}
 */
export function resolveResetTimeoutMs(value, defaultMs = 60000) {
  if (value === false || value === null) {
    return 0
  }

  if (value === undefined) {
    return Math.max(Number(defaultMs) || 0, 0)
  }

  const timeout = Number(value)

  if (!Number.isFinite(timeout) || timeout <= 0) {
    return 0
  }

  return timeout
}
