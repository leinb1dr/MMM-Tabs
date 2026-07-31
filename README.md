# MMM-Tabs

MMM-Tabs is a [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) module that shows the current page in a clickable dropdown for navigating between pages. It uses [Nunjucks templating](https://docs.magicmirror.builders/module-development/rendering.html) and integrates with [MMM-pages](https://github.com/sdetweil/MMM-pages).

## Features

- Current page indicator and page selector combined in one dropdown
- Dropdown lists all available pages with the active page selected
- Works with MMM-pages via `NEW_PAGE` and `MAX_PAGES_CHANGED` notifications
- Sends `PAGE_CHANGED` and `PAGE_SELECT` when a page is chosen from the dropdown

## Installation

```bash
cd ~/MagicMirror/modules
git clone https://github.com/leinb1dr/MMM-Tabs
cd MMM-Tabs
npm install
```

## Configuration

Add MMM-Tabs to the `modules` array in `config/config.js`. Include it in the `fixed` array of MMM-pages so it appears on every page.

### Example

```js
{
  module: "MMM-pages",
  config: {
    modules: [
      ["clock", "weather"],
      ["calendar", "newsfeed"]
    ],
    fixed: ["MMM-Tabs"]
  }
},
{
  module: "MMM-Tabs",
  position: "top_center",
  config: {
    pages: ["Home", "Calendar"],
    showDropdown: true
  }
}
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `pages` | `string[]` | `[]` | Display names for each page. When empty, names default to `Page 1`, `Page 2`, etc. |
| `showDropdown` | `boolean` | `true` | Whether to use a dropdown as the page indicator (falls back to a plain label when false or when only one page exists) |
| `defaultPagePrefix` | `string` | `"Page"` | Prefix used when generating default page names |

## Notifications

### Received

| Notification | Payload | Description |
| --- | --- | --- |
| `MAX_PAGES_CHANGED` | `number` | Sets the total number of pages from MMM-pages |
| `NEW_PAGE` | `number` | Updates the displayed current page index |

### Sent

| Notification | Payload | Description |
| --- | --- | --- |
| `PAGE_CHANGED` | `number` | Requests a page change (sdetweil/MMM-pages) |
| `PAGE_SELECT` | `number` | Requests a page change (edward-shen/MMM-pages) |

## Development

```bash
npm install
npm run lint
npm run storybook
npm test
```

### Storybook

Preview the Nunjucks template in isolation:

```bash
npm run storybook
```

### Playwright

Run browser tests against the fixture page and Storybook:

```bash
npm run test:playwright
npm run test:storybook
```

## License

This project is licensed under the MIT License. See [LICENSE.md](LICENSE.md) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
