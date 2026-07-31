import nunjucks from "nunjucks"
import { buildTemplateData } from "./template-data.js"

/**
 * Render the MMM-Tabs Nunjucks template with the provided data.
 *
 * @param {string} templateSource
 * @param {object} data
 * @returns {string}
 */
export function renderTabsTemplate(templateSource, data) {
  return nunjucks.renderString(templateSource, data)
}

export { buildTemplateData }
