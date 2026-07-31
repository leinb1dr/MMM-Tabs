/**
 * Build template data matching the module's getTemplateData output.
 *
 * @param {object} options
 * @param {string[]} [options.pages]
 * @param {number} [options.currentPage]
 * @param {number} [options.totalPages]
 * @param {boolean} [options.showDropdown]
 * @param {string} [options.defaultPagePrefix]
 * @returns {object}
 */
export function buildTemplateData({
  pages = [],
  currentPage = 0,
  totalPages = Math.max(pages.length, 3),
  showDropdown = true,
  defaultPagePrefix = "Page"
} = {}) {
  const pageNames = pages.length > 0
    ? pages.slice(0, totalPages)
    : Array.from(
        { length: totalPages },
        (_, index) => `${defaultPagePrefix} ${index + 1}`
      )

  const currentPageName = pageNames[currentPage] ?? `${defaultPagePrefix} ${currentPage + 1}`
  const otherPages = pageNames
    .map((name, index) => ({ index, name }))
    .filter(page => page.index !== currentPage)

  return {
    currentPageName,
    otherPages,
    showDropdown: showDropdown && pageNames.length > 1
  }
}
