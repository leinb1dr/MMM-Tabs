import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  getSelectorsForPage,
  hasVisibilitySelectors,
  normalizePagesConfig,
  normalizeSelectorList
} from "../lib/page-config.js"
import {
  getModuleClassNames,
  moduleMatchesSelectors,
  partitionModulesByVisibility,
  selectModules
} from "../lib/module-visibility.js"

describe("normalizeSelectorList", () => {
  it("splits space-separated strings", () => {
    assert.deepEqual(normalizeSelectorList("home calendar"), ["home", "calendar"])
  })

  it("flattens arrays of class strings", () => {
    assert.deepEqual(normalizeSelectorList(["home", "page weather"]), ["home", "page", "weather"])
  })

  it("returns an empty list for empty values", () => {
    assert.deepEqual(normalizeSelectorList(""), [])
    assert.deepEqual(normalizeSelectorList(null), [])
    assert.deepEqual(normalizeSelectorList(undefined), [])
  })
})

describe("normalizePagesConfig", () => {
  it("keeps string pages as display names without selectors", () => {
    const normalized = normalizePagesConfig({
      pages: ["Home", "Calendar"]
    })

    assert.deepEqual(normalized.pages, [
      { name: "Home", classes: [], identifiers: [] },
      { name: "Calendar", classes: [], identifiers: [] }
    ])
    assert.equal(hasVisibilitySelectors(normalized), false)
  })

  it("normalizes object pages with classes and identifiers", () => {
    const normalized = normalizePagesConfig({
      pages: [
        { name: "Home", classes: "page-home", identifiers: ["module_3_calendar"] },
        { name: "Weather", classes: ["page-weather", "forecast"] }
      ],
      global: {
        classes: "always-on",
        identifiers: ["module_1_clock"]
      }
    })

    assert.deepEqual(normalized.pages[0], {
      name: "Home",
      classes: ["page-home"],
      identifiers: ["module_3_calendar"]
    })
    assert.deepEqual(normalized.pages[1].classes, ["page-weather", "forecast"])
    assert.deepEqual(normalized.global, {
      classes: ["always-on"],
      identifiers: ["module_1_clock"]
    })
    assert.equal(hasVisibilitySelectors(normalized), true)
  })
})

describe("getSelectorsForPage", () => {
  it("merges global selectors with the active page selectors", () => {
    const selectors = getSelectorsForPage({
      pages: [
        { name: "Home", classes: ["page-home"], identifiers: ["module_2_news"] },
        { name: "Weather", classes: ["page-weather"], identifiers: [] }
      ],
      global: {
        classes: ["always"],
        identifiers: ["module_1_clock"]
      },
      pageIndex: 0
    })

    assert.deepEqual(selectors.classes.sort(), ["always", "page-home"])
    assert.deepEqual(selectors.identifiers.sort(), ["module_1_clock", "module_2_news"])
  })
})

describe("module visibility selection", () => {
  const tabs = { name: "MMM-Tabs", identifier: "module_0_MMM-Tabs" }
  const clock = {
    name: "clock",
    identifier: "module_1_clock",
    data: { classes: "always" }
  }
  const calendarHome = {
    name: "calendar",
    identifier: "module_2_calendar",
    data: { classes: "page-home" }
  }
  const calendarWork = {
    name: "calendar",
    identifier: "module_3_calendar",
    data: { classes: "page-work" }
  }
  const news = {
    name: "newsfeed",
    identifier: "module_4_newsfeed",
    data: { classes: "" }
  }

  it("reads class names from module data and the module name", () => {
    assert.deepEqual([...getModuleClassNames(calendarHome)].sort(), ["calendar", "page-home"])
  })

  it("matches duplicate module instances by class", () => {
    assert.equal(moduleMatchesSelectors(calendarHome, { classes: ["page-home"] }), true)
    assert.equal(moduleMatchesSelectors(calendarWork, { classes: ["page-home"] }), false)
  })

  it("matches a specific instance by identifier", () => {
    assert.equal(
      moduleMatchesSelectors(news, { identifiers: ["module_4_newsfeed"] }),
      true
    )
    assert.equal(
      moduleMatchesSelectors(calendarHome, { identifiers: ["module_4_newsfeed"] }),
      false
    )
  })

  it("partitions modules and never hides the controlling module", () => {
    const { toShow, toHide } = partitionModulesByVisibility(
      [tabs, clock, calendarHome, calendarWork, news],
      {
        selectors: {
          classes: ["always", "page-home"],
          identifiers: ["module_4_newsfeed"]
        },
        selfModule: tabs
      }
    )

    assert.deepEqual(toShow.map(module => module.identifier).sort(), [
      "module_1_clock",
      "module_2_calendar",
      "module_4_newsfeed"
    ])
    assert.deepEqual(toHide.map(module => module.identifier), ["module_3_calendar"])
    assert.equal(toShow.includes(tabs), false)
    assert.equal(toHide.includes(tabs), false)
  })

  it("selects modules with MagicMirror-style withClass collections", () => {
    const modules = createModuleCollection([tabs, clock, calendarHome, calendarWork, news])
    const selected = selectModules(
      modules,
      { classes: ["page-work"], identifiers: ["module_1_clock"] },
      tabs
    )

    assert.deepEqual(selected.map(module => module.identifier).sort(), [
      "module_1_clock",
      "module_3_calendar"
    ])
  })
})

/**
 * Minimal stand-in for MagicMirror's ModuleCollection filtering API.
 *
 * @param {object[]} modules
 * @returns {object}
 */
function createModuleCollection(modules) {
  const collection = [...modules]

  collection.withClass = (classnames) => {
    const wanted = Array.isArray(classnames)
      ? classnames
      : String(classnames).trim().split(/\s+/)

    return createModuleCollection(
      collection.filter((moduleInstance) => {
        const classNames = getModuleClassNames(moduleInstance)
        return wanted.some(className => classNames.has(className))
      })
    )
  }

  collection.exceptModule = moduleInstance =>
    createModuleCollection(collection.filter(item => item !== moduleInstance))

  collection.enumerate = (callback) => {
    for (const moduleInstance of collection) {
      callback(moduleInstance)
    }
  }

  return collection
}
