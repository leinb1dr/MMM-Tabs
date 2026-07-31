# MMM-Tabs

MMM-Tabs is a [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) module that shows the current page in a clickable dropdown and can show or hide other modules per page. It uses [Nunjucks templating](https://docs.magicmirror.builders/module-development/rendering.html) and MagicMirror [module selection](https://docs.magicmirror.builders/module-development/helper-methods.html#module-selection) (`MM.getModules()`, `withClass`, `exceptModule`).

## Features

- Current page indicator and page selector combined in one clickable dropdown
- Page configs select modules by **class** and/or **identifier** (safe with multiple instances of the same module)
- Global selectors for modules that stay visible on every page
- MMM-Tabs itself is always excluded from hiding
- Custom dropdown styled to match MagicMirror themes (overridable via `--mmm-tabs-*` CSS variables)
- Compatible notifications for other page-aware modules (`PAGE_CHANGED`, `PAGE_SELECT`, `NEW_PAGE`, `MAX_PAGES_CHANGED`)
- Optional idle reset that returns to the first page after inactivity (1 minute by default)

## Installation

```bash
cd ~/MagicMirror/modules
git clone https://github.com/leinb1dr/MMM-Tabs
cd MMM-Tabs
npm install
```

## Configuration

Add MMM-Tabs to the `modules` array in `config/config.js`. Assign each paged module a `classes` value (and/or use its MagicMirror `identifier`) so pages can target specific instances.

### Example

```js
{
  module: "MMM-Tabs",
  position: "top_center",
  config: {
    pages: [
      {
        name: "Home",
        classes: ["page-home"],
        identifiers: ["module_4_newsfeed"]
      },
      {
        name: "Calendar",
        classes: ["page-calendar"]
      }
    ],
    global: {
      classes: ["always"],
      identifiers: []
    },
    showDropdown: true,
    animationTime: 1000,
    resetTimeout: 60000
  }
},
{
  module: "clock",
  position: "top_left",
  classes: "always"
},
{
  module: "calendar",
  position: "top_left",
  classes: "page-home",
  header: "Home calendar",
  config: { /* ... */ }
},
{
  module: "calendar",
  position: "top_left",
  classes: "page-calendar",
  header: "Work calendar",
  config: { /* ... */ }
},
{
  module: "newsfeed",
  position: "bottom_bar",
  // Optional: target this exact instance via identifiers in a page config
  config: { /* ... */ }
}
```

When any page or `global` entry includes `classes` or `identifiers`, MMM-Tabs controls visibility:

- Modules matching the **current page** selectors are shown
- Modules matching **global** selectors are shown on every page
- All other modules are hidden
- MMM-Tabs is never hidden

Identifiers are the unique DOM ids MagicMirror assigns (for example `module_4_newsfeed`). Find them in the browser developer tools. Prefer `classes` when you can, since identifiers can change if you reorder modules in `config.js`.

### Name-only pages (UI only)

If `pages` is a list of strings and `global` has no selectors, MMM-Tabs only renders the dropdown and still sends/receives page notifications (for use with modules like MMM-pages):

```js
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
| `pages` | `Array<string \| Page>` | `[]` | Page list. A string is a display name only. A `Page` object may include `name`, `classes`, and `identifiers`. |
| `global` | `{ classes?: string \| string[], identifiers?: string \| string[] }` | `{ classes: [], identifiers: [] }` | Selectors for modules visible on every page. |
| `showDropdown` | `boolean` | `true` | Whether to use a themed dropdown as the page indicator (falls back to a plain label when false or when only one page exists) |
| `defaultPagePrefix` | `string` | `"Page"` | Prefix used when generating default page names |
| `animationTime` | `number` | `1000` | Total show/hide animation time in milliseconds |
| `useLockString` | `boolean` | `true` | Pass MagicMirror visibility lock strings when showing/hiding modules |
| `resetTimeout` | `number \| false` | `60000` | Idle time in milliseconds before returning to the first page. Pointer and keyboard activity restart the timer. Set to `0` or `false` to disable. |

#### Page object

| Field | Type | Description |
| --- | --- | --- |
| `name` | `string` | Label shown in the dropdown |
| `classes` | `string \| string[]` | Class names used with `MM.getModules().withClass(...)` |
| `identifiers` | `string \| string[]` | Exact MagicMirror module identifiers to show on this page |

`classes` and `identifiers` accept a space-separated string or an array.

## Notifications

### Received

| Notification | Payload | Description |
| --- | --- | --- |
| `MAX_PAGES_CHANGED` | `number` | Sets the total number of pages when MMM-Tabs is not managing visibility itself |
| `NEW_PAGE` | `number` | Updates the displayed current page index (and visibility when enabled) |
| `DOM_OBJECTS_CREATED` | — | Applies initial module visibility when selectors are configured |

### Sent

| Notification | Payload | Description |
| --- | --- | --- |
| `PAGE_CHANGED` | `number` | Requests a page change |
| `PAGE_SELECT` | `number` | Requests a page change |
| `MAX_PAGES_CHANGED` | `number` | Emitted on startup when MMM-Tabs manages pages |
| `NEW_PAGE` | `number` | Emitted on startup when MMM-Tabs manages pages |

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
