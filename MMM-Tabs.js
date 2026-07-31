Module.register("MMM-Tabs", {

  defaults: {
    pages: [],
    global: {
      classes: [],
      identifiers: []
    },
    showDropdown: true,
    defaultPagePrefix: "Page",
    animationTime: 1000,
    useLockString: true,
    // Idle time before returning to the first page. Set to 0 or false to disable.
    resetTimeout: 60000
  },

  start() {
    this.normalized = this.normalizePagesConfig()
    this.visibilityEnabled = this.hasVisibilitySelectors(this.normalized)
    this.currentPage = 0
    this.totalPages = Math.max(this.normalized.pages.length, 1)
    this.resetTimer = null
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
      case "DOM_OBJECTS_CREATED":
        if (this.visibilityEnabled) {
          this.applyModuleVisibility()
          this.sendNotification("MAX_PAGES_CHANGED", this.totalPages)
          this.sendNotification("NEW_PAGE", this.currentPage)
        }
        break

      case "MAX_PAGES_CHANGED":
        if (!this.visibilityEnabled && Number.isInteger(payload) && payload > 0) {
          this.totalPages = payload
          this.updateDom()
        }
        break

      case "NEW_PAGE":
        if (typeof payload === "number" && !Number.isNaN(payload)) {
          this.setCurrentPage(payload, { applyVisibility: this.visibilityEnabled })
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

  normalizeSelectorList(value) {
    if (value == null || value === "") {
      return []
    }

    if (Array.isArray(value)) {
      return value
        .flatMap(item => String(item).trim().split(/\s+/))
        .filter(Boolean)
    }

    return String(value).trim().split(/\s+/).filter(Boolean)
  },

  normalizePage(page, index) {
    if (typeof page === "string") {
      return {
        name: page || `${this.config.defaultPagePrefix} ${index + 1}`,
        classes: [],
        identifiers: []
      }
    }

    if (page && typeof page === "object") {
      const name = typeof page.name === "string" && page.name.trim()
        ? page.name.trim()
        : `${this.config.defaultPagePrefix} ${index + 1}`

      return {
        name,
        classes: this.normalizeSelectorList(page.classes),
        identifiers: this.normalizeSelectorList(page.identifiers)
      }
    }

    return {
      name: `${this.config.defaultPagePrefix} ${index + 1}`,
      classes: [],
      identifiers: []
    }
  },

  normalizePagesConfig() {
    const pageList = Array.isArray(this.config.pages) ? this.config.pages : []
    const globalConfig = this.config.global && typeof this.config.global === "object"
      ? this.config.global
      : {}

    return {
      pages: pageList.map((page, index) => this.normalizePage(page, index)),
      global: {
        classes: this.normalizeSelectorList(globalConfig.classes),
        identifiers: this.normalizeSelectorList(globalConfig.identifiers)
      }
    }
  },

  hasVisibilitySelectors(normalized) {
    if (normalized.global.classes.length > 0 || normalized.global.identifiers.length > 0) {
      return true
    }

    return normalized.pages.some(page =>
      page.classes.length > 0 || page.identifiers.length > 0
    )
  },

  getSelectorsForPage(pageIndex) {
    const page = this.normalized.pages[pageIndex] ?? { classes: [], identifiers: [] }

    return {
      classes: [...new Set([
        ...this.normalized.global.classes,
        ...page.classes
      ])],
      identifiers: [...new Set([
        ...this.normalized.global.identifiers,
        ...page.identifiers
      ])]
    }
  },

  getPageNames() {
    if (this.normalized.pages.length > 0) {
      return this.normalized.pages
        .slice(0, this.totalPages)
        .map(page => page.name)
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
      this.clearResetTimeout()
      return
    }

    const dropdown = root.querySelector(".mmm-tabs-dropdown")

    if (dropdown) {
      const trigger = dropdown.querySelector(".mmm-tabs-trigger")
      const menu = dropdown.querySelector(".mmm-tabs-menu")
      const options = [...dropdown.querySelectorAll(".mmm-tabs-option")]

      if (trigger && menu) {
        trigger.onclick = (event) => {
          event.stopPropagation()
          this.onUserActivity()
          this.toggleDropdown(dropdown, trigger, menu)
        }

        for (const option of options) {
          option.onclick = (event) => {
            event.stopPropagation()
            this.selectPage(option.dataset.value)
          }
        }
      }
    }

    if (dropdown || this.getResetTimeoutMs() > 0) {
      this.setupGlobalListeners()
      this.scheduleResetTimeout()
    } else {
      this.teardownGlobalListeners()
      this.clearResetTimeout()
    }
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

    if (Number.isNaN(pageIndex)) {
      return
    }

    // Update the title immediately so the label stays in sync with the selection,
    // even before an external NEW_PAGE notification arrives (and when it never does).
    this.setCurrentPage(pageIndex, { applyVisibility: this.visibilityEnabled })
    this.sendNotification("PAGE_CHANGED", pageIndex)
    this.sendNotification("PAGE_SELECT", pageIndex)
  },

  setCurrentPage(pageIndex, { applyVisibility = false } = {}) {
    if (this.currentPage === pageIndex) {
      // Still close an open menu when re-selecting the current page.
      const dropdown = this.getContentRoot()?.querySelector(".mmm-tabs-dropdown.open")

      if (dropdown) {
        const trigger = dropdown.querySelector(".mmm-tabs-trigger")
        const menu = dropdown.querySelector(".mmm-tabs-menu")
        this.closeDropdown(dropdown, trigger, menu)
      }

      if (applyVisibility) {
        this.applyModuleVisibility()
      }

      this.scheduleResetTimeout()
      return
    }

    this.currentPage = pageIndex
    this.updateDom()

    if (applyVisibility) {
      this.applyModuleVisibility()
    }

    this.scheduleResetTimeout()
  },

  /**
   * Idle milliseconds before returning to the first page.
   * `0` / `false` / `null` / non-positive values disable the reset.
   */
  getResetTimeoutMs() {
    const value = this.config.resetTimeout

    if (value === false || value === null) {
      return 0
    }

    const timeout = Number(value)

    if (!Number.isFinite(timeout) || timeout <= 0) {
      return 0
    }

    return timeout
  },

  clearResetTimeout() {
    if (this.resetTimer != null) {
      clearTimeout(this.resetTimer)
      this.resetTimer = null
    }
  },

  scheduleResetTimeout() {
    this.clearResetTimeout()

    const timeout = this.getResetTimeoutMs()

    if (timeout <= 0 || this.currentPage === 0) {
      return
    }

    this.resetTimer = setTimeout(() => {
      this.handleResetTimeout()
    }, timeout)
  },

  handleResetTimeout() {
    this.resetTimer = null

    if (this.currentPage === 0 || this.getResetTimeoutMs() <= 0) {
      return
    }

    this.selectPage(0)
  },

  onUserActivity() {
    this.scheduleResetTimeout()
  },

  /**
   * Show modules matching the current page + global selectors; hide the rest.
   * MMM-Tabs itself is always excluded from hiding.
   *
   * Uses MagicMirror module selection helpers:
   * https://docs.magicmirror.builders/module-development/helper-methods.html#module-selection
   */
  applyModuleVisibility() {
    if (typeof MM === "undefined" || typeof MM.getModules !== "function") {
      return
    }

    const selectors = this.getSelectorsForPage(this.currentPage)
    const animationTime = Math.max(Number(this.config.animationTime) || 0, 0)
    const hideTime = animationTime / 2
    const lockStringObj = this.config.useLockString
      ? { lockString: this.identifier }
      : undefined

    // Class selection uses MM.getModules().withClass(); identifiers are matched
    // manually because MagicMirror has no withIdentifier helper.
    const matched = new Set()

    if (selectors.classes.length > 0) {
      MM.getModules()
        .withClass(selectors.classes)
        .enumerate((moduleInstance) => {
          matched.add(moduleInstance)
        })
    }

    if (selectors.identifiers.length > 0) {
      MM.getModules().enumerate((moduleInstance) => {
        if (selectors.identifiers.includes(moduleInstance.identifier)) {
          matched.add(moduleInstance)
        }
      })
    }

    matched.delete(this)

    MM.getModules()
      .exceptModule(this)
      .enumerate((moduleInstance) => {
        if (!matched.has(moduleInstance)) {
          moduleInstance.hide(hideTime, () => {}, lockStringObj)
        }
      })

    setTimeout(() => {
      for (const moduleInstance of matched) {
        moduleInstance.show(hideTime, () => {}, lockStringObj)
      }
    }, hideTime)
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
    this.onUserActivity()

    const dropdown = this.getContentRoot()?.querySelector(".mmm-tabs-dropdown.open")

    if (!dropdown || dropdown.contains(event.target)) {
      return
    }

    const trigger = dropdown.querySelector(".mmm-tabs-trigger")
    const menu = dropdown.querySelector(".mmm-tabs-menu")
    this.closeDropdown(dropdown, trigger, menu)
  },

  handleKeydown(event) {
    this.onUserActivity()

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
        // Focus the trigger after DOM refresh (or immediately if page unchanged).
        this.getContentRoot()?.querySelector(".mmm-tabs-trigger")?.focus()
      }
    }
  },

  suspend() {
    this.clearResetTimeout()
  },

  resume() {
    this.scheduleResetTimeout()
  }
})
