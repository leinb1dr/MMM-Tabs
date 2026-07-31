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
  }
}

export default preview
