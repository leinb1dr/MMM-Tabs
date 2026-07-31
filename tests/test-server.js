import { createServer } from "node:http"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildTemplateData, renderTabsTemplateFromFile } from "./render-template.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT ?? 4173)
const css = fs.readFileSync(path.resolve(__dirname, "..", "MMM-Tabs.css"), "utf8")

const scenarios = {
  home: buildTemplateData({
    pages: ["Home", "Calendar", "Weather"],
    currentPage: 0
  }),
  calendar: buildTemplateData({
    pages: ["Home", "Calendar", "Weather"],
    currentPage: 1
  }),
  single: buildTemplateData({
    pages: ["Dashboard"],
    currentPage: 0
  })
}

function renderPage(scenarioKey) {
  const data = scenarios[scenarioKey] ?? scenarios.home
  const html = renderTabsTemplateFromFile(data)

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MMM-Tabs Test</title>
    <style>
      :root {
        --color-text: #999;
        --color-text-dimmed: #666;
        --color-text-bright: #fff;
        --color-background: #000;
      }

      body {
        background: var(--color-background);
        color: var(--color-text);
        font-family: "Roboto Condensed", "Roboto", sans-serif;
        margin: 2rem;
      }

      .bright {
        color: var(--color-text-bright);
      }

      ${css}
    </style>
  </head>
  <body>
    <!-- Mirror MagicMirror module wrapper: #identifier.module.MMM-Tabs > .module-content -->
    <div id="module_1_MMM-Tabs" class="module MMM-Tabs" data-scenario="${scenarioKey}">
      <header class="module-header" style="display: none;"></header>
      <div class="module-content">
        <div>
          ${html}
        </div>
      </div>
    </div>
    <script>
      const moduleIdentifier = "module_1_MMM-Tabs"

      const output = document.createElement("output")
      output.id = "selected-page"
      output.setAttribute("aria-live", "polite")
      document.body.appendChild(output)

      // Same DOM lookup MagicMirror modules must use (MM does not set this.dom).
      const getModuleElement = () => document.getElementById(moduleIdentifier)
      const getContentRoot = () => getModuleElement()?.querySelector(".module-content") ?? null

      const root = getContentRoot()
      const dropdown = root?.querySelector(".mmm-tabs-dropdown")

      if (dropdown) {
        const moduleElement = getModuleElement()
        const rootStyles = getComputedStyle(document.documentElement)
        for (const [localName, rootName] of [
          ["--mmm-tabs-text", "--color-text"],
          ["--mmm-tabs-text-dimmed", "--color-text-dimmed"],
          ["--mmm-tabs-text-bright", "--color-text-bright"],
          ["--mmm-tabs-background", "--color-background"]
        ]) {
          const value = rootStyles.getPropertyValue(rootName).trim()
          if (value) {
            moduleElement.style.setProperty(localName, value)
          }
        }

        const trigger = dropdown.querySelector(".mmm-tabs-trigger")
        const menu = dropdown.querySelector(".mmm-tabs-menu")
        const options = [...dropdown.querySelectorAll(".mmm-tabs-option")]

        const open = () => {
          dropdown.classList.add("open")
          trigger.setAttribute("aria-expanded", "true")
          menu.hidden = false
        }

        const close = () => {
          dropdown.classList.remove("open")
          trigger.setAttribute("aria-expanded", "false")
          menu.hidden = true
        }

        trigger.onclick = (event) => {
          event.stopPropagation()
          if (dropdown.classList.contains("open")) {
            close()
          } else {
            open()
          }
        }

        for (const option of options) {
          option.onclick = (event) => {
            event.stopPropagation()
            const pageIndex = option.dataset.value
            output.textContent = pageIndex

            for (const item of options) {
              const selected = item.dataset.value === pageIndex
              item.classList.toggle("selected", selected)
              item.setAttribute("aria-selected", selected ? "true" : "false")
            }

            const label = trigger.querySelector(".mmm-tabs-label")
            if (label) {
              label.textContent = option.textContent
            }

            close()
          }
        }

        document.addEventListener("pointerdown", (event) => {
          const openDropdown = getContentRoot()?.querySelector(".mmm-tabs-dropdown.open")
          if (openDropdown && !openDropdown.contains(event.target)) {
            close()
          }
        })
      }
    </script>
  </body>
</html>`
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`)
  const scenario = url.searchParams.get("scenario") ?? "home"

  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
  response.end(renderPage(scenario))
})

server.listen(port, "127.0.0.1", () => {
  console.log(`MMM-Tabs test server running at http://127.0.0.1:${port}`)
})
