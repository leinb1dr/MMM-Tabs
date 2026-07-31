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
      body {
        background: #000;
        color: #fff;
        font-family: "Roboto", sans-serif;
        margin: 2rem;
      }

      ${css}
    </style>
  </head>
  <body>
    <div class="MMM-Tabs" data-scenario="${scenarioKey}">
      ${html}
    </div>
    <script>
      const select = document.querySelector(".mmm-tabs-select")
      const output = document.createElement("output")
      output.id = "selected-page"
      output.setAttribute("aria-live", "polite")
      document.body.appendChild(output)

      if (select) {
        select.addEventListener("change", (event) => {
          output.textContent = event.target.value
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
