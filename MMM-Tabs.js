Module.register("MMM-Tabs", {

  defaults: {
    pages: [],
    showDropdown: true,
    defaultPagePrefix: "Page"
  },

  start() {
    this.currentPage = 0
    this.totalPages = Math.max(this.config.pages.length, 1)
    this.boundOutsidePointer = this.handleOutsidePointer.bind(this)
    this.boundKeydown = this.handleKeydown.bind(this)
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
      pages: pages.map((name, index) => ({ index, name })),
      currentPage: this.currentPage,
      currentPageName: pages[this.currentPage] ?? `${this.config.defaultPagePrefix} ${this.currentPage + 1}`,
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
        this.applyThemeVariables()
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

  // MagicMirror does not set `this.dom`. Module content lives under
  // `#${this.identifier} > .module-content`.
  getModuleElement() {
    return document.getElementById(this.identifier)
  },

  getContentRoot() {
    return this.getModuleElement()?.querySelector(".module-content") ?? null
  },

  applyThemeVariables() {
    const moduleElement = this.getModuleElement()

    if (!moduleElement) {
      return
    }

    const rootStyles = getComputedStyle(document.documentElement)
    const themeMap = {
      "--mmm-tabs-text": "--color-text",
      "--mmm-tabs-text-dimmed": "--color-text-dimmed",
      "--mmm-tabs-text-bright": "--color-text-bright",
      "--mmm-tabs-background": "--color-background"
    }

    for (const [localName, rootName] of Object.entries(themeMap)) {
      const value = rootStyles.getPropertyValue(rootName).trim()

      if (value) {
        moduleElement.style.setProperty(localName, value)
      }
    }
  },

  attachDropdownHandler() {
    const root = this.getContentRoot()

    if (!root) {
      this.teardownGlobalListeners()
      return
    }

    const dropdown = root.querySelector(".mmm-tabs-dropdown")

    if (!dropdown) {
      this.teardownGlobalListeners()
      return
    }

    const trigger = dropdown.querySelector(".mmm-tabs-trigger")
    const menu = dropdown.querySelector(".mmm-tabs-menu")
    const options = [...dropdown.querySelectorAll(".mmm-tabs-option")]

    if (!trigger || !menu) {
      return
    }

    trigger.onclick = (event) => {
      event.stopPropagation()
      this.toggleDropdown(dropdown, trigger, menu)
    }

    for (const option of options) {
      option.onclick = (event) => {
        event.stopPropagation()
        this.selectPage(option.dataset.value)
        this.closeDropdown(dropdown, trigger, menu)
      }
    }

    this.setupGlobalListeners()
  },

  toggleDropdown(dropdown, trigger, menu) {
    if (dropdown.classList.contains("open")) {
      this.closeDropdown(dropdown, trigger, menu)
      return
    }

    this.openDropdown(dropdown, trigger, menu)
  },

  openDropdown(dropdown, trigger, menu) {
    dropdown.classList.add("open")
    trigger.setAttribute("aria-expanded", "true")
    menu.hidden = false

    const selected = menu.querySelector(".mmm-tabs-option[aria-selected=\"true\"]")
      ?? menu.querySelector(".mmm-tabs-option")

    selected?.focus()
  },

  closeDropdown(dropdown, trigger, menu) {
    dropdown.classList.remove("open")
    trigger.setAttribute("aria-expanded", "false")
    menu.hidden = true
  },

  selectPage(value) {
    const pageIndex = Number.parseInt(value, 10)

    if (!Number.isNaN(pageIndex)) {
      this.sendNotification("PAGE_CHANGED", pageIndex)
      this.sendNotification("PAGE_SELECT", pageIndex)
    }
  },

  setupGlobalListeners() {
    if (this.listenersAttached) {
      return
    }

    document.addEventListener("pointerdown", this.boundOutsidePointer)
    document.addEventListener("keydown", this.boundKeydown)
    this.listenersAttached = true
  },

  teardownGlobalListeners() {
    if (!this.listenersAttached) {
      return
    }

    document.removeEventListener("pointerdown", this.boundOutsidePointer)
    document.removeEventListener("keydown", this.boundKeydown)
    this.listenersAttached = false
  },

  handleOutsidePointer(event) {
    const dropdown = this.getContentRoot()?.querySelector(".mmm-tabs-dropdown.open")

    if (!dropdown || dropdown.contains(event.target)) {
      return
    }

    const trigger = dropdown.querySelector(".mmm-tabs-trigger")
    const menu = dropdown.querySelector(".mmm-tabs-menu")
    this.closeDropdown(dropdown, trigger, menu)
  },

  handleKeydown(event) {
    const dropdown = this.getContentRoot()?.querySelector(".mmm-tabs-dropdown")

    if (!dropdown) {
      return
    }

    const trigger = dropdown.querySelector(".mmm-tabs-trigger")
    const menu = dropdown.querySelector(".mmm-tabs-menu")
    const isOpen = dropdown.classList.contains("open")

    if (event.key === "Escape" && isOpen) {
      this.closeDropdown(dropdown, trigger, menu)
      trigger.focus()
      return
    }

    if (!isOpen) {
      return
    }

    const options = [...menu.querySelectorAll(".mmm-tabs-option")]
    const currentIndex = options.findIndex(option => option === document.activeElement)

    if (event.key === "ArrowDown") {
      event.preventDefault()
      options[(currentIndex + 1) % options.length]?.focus()
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      options[(currentIndex - 1 + options.length) % options.length]?.focus()
      return
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      if (currentIndex >= 0) {
        this.selectPage(options[currentIndex].dataset.value)
        this.closeDropdown(dropdown, trigger, menu)
        trigger.focus()
      }
    }
  }
})
