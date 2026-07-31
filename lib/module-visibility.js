/**
 * Decide whether a module instance matches the given selectors.
 * Matching is by class name (via module.data.classes / module.name) or identifier.
 *
 * @param {object} moduleInstance
 * @param {{ classes?: string[], identifiers?: string[] }} selectors
 * @returns {boolean}
 */
export function moduleMatchesSelectors(moduleInstance, selectors = {}) {
  const classes = selectors.classes ?? []
  const identifiers = selectors.identifiers ?? []

  if (identifiers.length > 0 && identifiers.includes(moduleInstance.identifier)) {
    return true
  }

  if (classes.length === 0) {
    return false
  }

  const moduleClasses = getModuleClassNames(moduleInstance)
  return classes.some(className => moduleClasses.has(className))
}

/**
 * Collect class names associated with a MagicMirror module instance.
 * Includes the module name and any configured `classes` / `data.classes`.
 *
 * @param {object} moduleInstance
 * @returns {Set<string>}
 */
export function getModuleClassNames(moduleInstance) {
  const classNames = new Set()

  if (moduleInstance?.name) {
    classNames.add(moduleInstance.name)
  }

  const rawClasses = [
    moduleInstance?.data?.classes,
    moduleInstance?.classes
  ]

  for (const value of rawClasses) {
    if (!value) {
      continue
    }

    for (const className of String(value).trim().split(/\s+/)) {
      if (className) {
        classNames.add(className)
      }
    }
  }

  return classNames
}

/**
 * Partition modules into those that should be shown vs hidden for a page.
 * The controlling module (`selfModule`) is always excluded from hiding.
 *
 * @param {object[]} modules
 * @param {object} options
 * @param {{ classes?: string[], identifiers?: string[] }} options.selectors
 * @param {object} options.selfModule
 * @returns {{ toShow: object[], toHide: object[] }}
 */
export function partitionModulesByVisibility(modules, { selectors, selfModule }) {
  const toShow = []
  const toHide = []

  for (const moduleInstance of modules) {
    if (moduleInstance === selfModule) {
      continue
    }

    if (moduleMatchesSelectors(moduleInstance, selectors)) {
      toShow.push(moduleInstance)
    } else {
      toHide.push(moduleInstance)
    }
  }

  return { toShow, toHide }
}

/**
 * Select modules from a MagicMirror ModuleCollection-like list using classes
 * and/or identifiers. Falls back to manual filtering when collection helpers
 * are unavailable (e.g. unit tests).
 *
 * @param {object[]|{ withClass?: Function, enumerate?: Function }} modules
 * @param {{ classes?: string[], identifiers?: string[] }} selectors
 * @param {object} [selfModule]
 * @returns {object[]}
 */
export function selectModules(modules, selectors = {}, selfModule) {
  const classes = selectors.classes ?? []
  const identifiers = selectors.identifiers ?? []
  const matched = new Set()

  const list = Array.isArray(modules)
    ? modules
    : (typeof modules?.enumerate === "function"
        ? (() => {
            const collected = []
            modules.enumerate(moduleInstance => collected.push(moduleInstance))
            return collected
          })()
        : [])

  if (classes.length > 0 && typeof modules?.withClass === "function") {
    const byClass = modules.withClass(classes)
    if (typeof byClass?.enumerate === "function") {
      byClass.enumerate(moduleInstance => matched.add(moduleInstance))
    } else if (Array.isArray(byClass)) {
      for (const moduleInstance of byClass) {
        matched.add(moduleInstance)
      }
    }
  } else if (classes.length > 0) {
    for (const moduleInstance of list) {
      if (moduleMatchesSelectors(moduleInstance, { classes, identifiers: [] })) {
        matched.add(moduleInstance)
      }
    }
  }

  if (identifiers.length > 0) {
    for (const moduleInstance of list) {
      if (identifiers.includes(moduleInstance.identifier)) {
        matched.add(moduleInstance)
      }
    }
  }

  if (selfModule) {
    matched.delete(selfModule)
  }

  return [...matched]
}
