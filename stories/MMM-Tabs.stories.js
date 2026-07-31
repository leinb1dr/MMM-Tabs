import "../MMM-Tabs.css"
import templateSource from "../MMM-Tabs.njk?raw"
import { buildTemplateData, renderTabsTemplate } from "../lib/render-template.js"

/**
 * @param {object} data
 * @param {{ open?: boolean }} [options]
 * @returns {HTMLElement}
 */
function renderTabs(data, options = {}) {
  const wrapper = document.createElement("div")
  wrapper.className = "MMM-Tabs"
  wrapper.innerHTML = renderTabsTemplate(templateSource, data)

  if (options.open) {
    const dropdown = wrapper.querySelector(".mmm-tabs-dropdown")
    const trigger = wrapper.querySelector(".mmm-tabs-trigger")
    const menu = wrapper.querySelector(".mmm-tabs-menu")

    if (dropdown && trigger && menu) {
      dropdown.classList.add("open")
      trigger.setAttribute("aria-expanded", "true")
      menu.hidden = false
    }
  }

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

export const OpenDropdown = {
  render: () => renderTabs(buildTemplateData({
    pages: ["Home", "Calendar", "Weather"],
    currentPage: 0
  }), { open: true })
}

export const ClassBasedPages = {
  render: () => renderTabs(buildTemplateData({
    pages: [
      { name: "Home", classes: ["page-home"] },
      { name: "Calendar", classes: ["page-calendar"] },
      { name: "Weather", classes: ["page-weather"] }
    ],
    currentPage: 0
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
