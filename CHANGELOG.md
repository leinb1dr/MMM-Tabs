# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Fixed

- Update the dropdown title immediately when a page is selected (no longer wait only on `NEW_PAGE`)
- Restore dropdown clicks by resolving the module DOM via `#${identifier} > .module-content` (MagicMirror does not set `this.dom`)

### Changed

- Replaced the native `<select>` with a custom dropdown styled for MagicMirror themes
- Dropdown colors follow MagicMirror theme variables when available (`--color-text`, etc.)
- Combined the page indicator and dropdown into a single clickable control
- Dropdown now lists all pages with the current page selected
- Enabled pointer events so the dropdown is clickable on MagicMirror

## 1.0.0 - 2026-07-31

### Added

- MMM-Tabs module with Nunjucks template rendering
- Current page name display with dropdown navigation
- Integration with MMM-pages notifications
- Storybook stories for template preview
- Playwright tests for fixture page and Storybook stories

### Removed

- MMM-Template starter files and example content
