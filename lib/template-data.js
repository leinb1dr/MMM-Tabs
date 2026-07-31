/**
 * Build template data matching the module's getTemplateData output.
 *
 * @param {object} options
 * @param {Array<string|object>} [options.pages]
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
    ? pages.slice(0, totalPages).map((page, index) => {
        if (typeof page === "string") {
          return page
        }

        if (page && typeof page === "object" && typeof page.name === "string" && page.name.trim()) {
          return page.name.trim()
        }

        return `${defaultPagePrefix} ${index + 1}`
      })
    : Array.from(
        { length: totalPages },
        (_, index) => `${defaultPagePrefix} ${index + 1}`
      )

  const currentPageName = pageNames[currentPage] ?? `${defaultPagePrefix} ${currentPage + 1}`
  const pageOptions = pageNames.map((name, index) => ({ index, name }))

  return {
    pages: pageOptions,
    currentPage,
    currentPageName,
    showDropdown: showDropdown && pageNames.length > 1
  }
}
