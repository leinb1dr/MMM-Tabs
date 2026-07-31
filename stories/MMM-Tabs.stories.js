import "../MMM-Tabs.css"
import templateSource from "../MMM-Tabs.njk?raw"
import { buildTemplateData, renderTabsTemplate } from "../lib/render-template.js"

/**
 * @param {object} data
 * @returns {HTMLElement}
 */
function renderTabs(data) {
  const wrapper = document.createElement("div")
  wrapper.className = "MMM-Tabs"
  wrapper.innerHTML = renderTabsTemplate(templateSource, data)
  return wrapper
}

export default {
  title: "MMM-Tabs",
  parameters: {
    docs: {
      description: {
        component: "Page navigation tabs for MagicMirror using Nunjucks templating."
      }
    }
  }
}

export const HomePage = {
  render: () => renderTabs(buildTemplateData({
    pages: ["Home", "Calendar", "Weather"],
    currentPage: 0
  }))
}

export const CalendarPage = {
  render: () => renderTabs(buildTemplateData({
    pages: ["Home", "Calendar", "Weather"],
    currentPage: 1
  }))
}

export const SinglePage = {
  render: () => renderTabs(buildTemplateData({
    pages: ["Dashboard"],
    currentPage: 0
  }))
}

export const DefaultPageNames = {
  render: () => renderTabs(buildTemplateData({
    pages: [],
    currentPage: 1,
    totalPages: 3,
    showDropdown: true
  }))
}

export const NoDropdown = {
  render: () => renderTabs(buildTemplateData({
    pages: ["Home", "Calendar", "Weather"],
    currentPage: 0,
    showDropdown: false
  }))
}
