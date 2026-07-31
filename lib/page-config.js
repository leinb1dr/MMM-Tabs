/**
 * Normalize a classes or identifiers value into a string array.
 *
 * @param {string|string[]|undefined|null} value
 * @returns {string[]}
 */
export function normalizeSelectorList(value) {
  if (value == null || value === "") {
    return []
  }

  if (Array.isArray(value)) {
    return value
      .flatMap(item => String(item).trim().split(/\s+/))
      .filter(Boolean)
  }

  return String(value).trim().split(/\s+/).filter(Boolean)
}

/**
 * Normalize a single page config entry.
 * String entries are treated as display names only.
 *
 * @param {string|object} page
 * @param {number} index
 * @param {string} defaultPagePrefix
 * @returns {{ name: string, classes: string[], identifiers: string[] }}
 */
export function normalizePage(page, index, defaultPagePrefix = "Page") {
  if (typeof page === "string") {
    return {
      name: page || `${defaultPagePrefix} ${index + 1}`,
      classes: [],
      identifiers: []
    }
  }

  if (page && typeof page === "object") {
    const name = typeof page.name === "string" && page.name.trim()
      ? page.name.trim()
      : `${defaultPagePrefix} ${index + 1}`

    return {
      name,
      classes: normalizeSelectorList(page.classes),
      identifiers: normalizeSelectorList(page.identifiers)
    }
  }

  return {
    name: `${defaultPagePrefix} ${index + 1}`,
    classes: [],
    identifiers: []
  }
}

/**
 * Normalize the global (always-visible) selector config.
 *
 * @param {object|undefined|null} globalConfig
 * @returns {{ classes: string[], identifiers: string[] }}
 */
export function normalizeGlobal(globalConfig) {
  if (!globalConfig || typeof globalConfig !== "object") {
    return { classes: [], identifiers: [] }
  }

  return {
    classes: normalizeSelectorList(globalConfig.classes),
    identifiers: normalizeSelectorList(globalConfig.identifiers)
  }
}

/**
 * Normalize the full pages config into a consistent structure.
 *
 * @param {object} options
 * @param {Array<string|object>} [options.pages]
 * @param {object} [options.global]
 * @param {string} [options.defaultPagePrefix]
 * @returns {{ pages: Array<{ name: string, classes: string[], identifiers: string[] }>, global: { classes: string[], identifiers: string[] } }}
 */
export function normalizePagesConfig({
  pages = [],
  global: globalConfig = {},
  defaultPagePrefix = "Page"
} = {}) {
  const pageList = Array.isArray(pages) ? pages : []

  return {
    pages: pageList.map((page, index) => normalizePage(page, index, defaultPagePrefix)),
    global: normalizeGlobal(globalConfig)
  }
}

/**
 * Collect combined selectors for the active page plus global modules.
 *
 * @param {object} options
 * @param {Array<{ name: string, classes: string[], identifiers: string[] }>} options.pages
 * @param {{ classes: string[], identifiers: string[] }} options.global
 * @param {number} options.pageIndex
 * @returns {{ classes: string[], identifiers: string[] }}
 */
export function getSelectorsForPage({ pages, global: globalSelectors, pageIndex }) {
  const page = pages[pageIndex] ?? { classes: [], identifiers: [] }
  const classes = [...new Set([
    ...normalizeSelectorList(globalSelectors?.classes),
    ...normalizeSelectorList(page.classes)
  ])]
  const identifiers = [...new Set([
    ...normalizeSelectorList(globalSelectors?.identifiers),
    ...normalizeSelectorList(page.identifiers)
  ])]

  return { classes, identifiers }
}

/**
 * Whether the config defines any class/identifier selectors for visibility control.
 *
 * @param {{ pages: Array<{ classes: string[], identifiers: string[] }>, global: { classes: string[], identifiers: string[] } }} normalized
 * @returns {boolean}
 */
export function hasVisibilitySelectors(normalized) {
  if (normalized.global.classes.length > 0 || normalized.global.identifiers.length > 0) {
    return true
  }

  return normalized.pages.some(page =>
    page.classes.length > 0 || page.identifiers.length > 0
  )
}
