import "../MMM-Tabs.css"

/** @type { import('@storybook/html').Preview } */
const preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#000000" }
      ]
    }
  },
  decorators: [
    (story) => {
      const root = document.createElement("div")
      root.style.setProperty("--color-text", "#999")
      root.style.setProperty("--color-text-dimmed", "#666")
      root.style.setProperty("--color-text-bright", "#fff")
      root.style.setProperty("--color-background", "#000")
      root.style.color = "#999"
      root.style.fontFamily = "\"Roboto Condensed\", \"Roboto\", sans-serif"
      root.appendChild(story())
      return root
    }
  ]
}

export default preview
