import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildTemplateData, renderTabsTemplate } from "../lib/render-template.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templatePath = path.resolve(__dirname, "..", "MMM-Tabs.njk")
const templateSource = fs.readFileSync(templatePath, "utf8")

/**
 * Render the MMM-Tabs Nunjucks template with the provided data.
 *
 * @param {object} data
 * @returns {string}
 */
export function renderTabsTemplateFromFile(data) {
  return renderTabsTemplate(templateSource, data)
}

export { buildTemplateData }
