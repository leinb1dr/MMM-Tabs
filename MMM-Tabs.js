Module.register("MMM-Tabs", {

  defaults: {
    pages: [],
    showDropdown: true,
    defaultPagePrefix: "Page"
  },

  start() {
    this.currentPage = 0
    this.totalPages = Math.max(this.config.pages.length, 1)
  },

  getStyles() {
    return ["MMM-Tabs.css"]
  },

  getTemplate() {
    return "MMM-Tabs.njk"
  },

  getTemplateData() {
    const pages = this.getPageNames()

    return {
      currentPageName: pages[this.currentPage] ?? `${this.config.defaultPagePrefix} ${this.currentPage + 1}`,
      otherPages: pages
        .map((name, index) => ({ index, name }))
        .filter(page => page.index !== this.currentPage),
      showDropdown: this.config.showDropdown && pages.length > 1
    }
  },

  notificationReceived(notification, payload) {
    switch (notification) {
      case "MAX_PAGES_CHANGED":
        if (Number.isInteger(payload) && payload > 0) {
          this.totalPages = payload
          this.updateDom()
        }
        break

      case "NEW_PAGE":
        if (typeof payload === "number" && !Number.isNaN(payload)) {
          this.currentPage = payload
          this.updateDom()
        }
        break

      case "MODULE_DOM_CREATED":
      case "MODULE_DOM_UPDATED":
        this.attachDropdownHandler()
        break

      default:
        break
    }
  },

  getPageNames() {
    if (this.config.pages.length > 0) {
      return this.config.pages.slice(0, this.totalPages)
    }

    return Array.from(
      { length: this.totalPages },
      (_, index) => `${this.config.defaultPagePrefix} ${index + 1}`
    )
  },

  attachDropdownHandler() {
    const select = this.dom.querySelector(".mmm-tabs-select")

    if (!select) {
      return
    }

    select.onchange = (event) => {
      const pageIndex = Number.parseInt(event.target.value, 10)

      if (!Number.isNaN(pageIndex)) {
        this.sendNotification("PAGE_CHANGED", pageIndex)
        this.sendNotification("PAGE_SELECT", pageIndex)
      }
    }
  }
})
