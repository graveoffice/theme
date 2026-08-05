# Agent notes

## Cursor Cloud specific instructions

This repo is a TypeScript theme package (`@grave/theme`) for VS Code, Cursor, Zed, and Shiki.

### Setup

Dependencies install via the cloud environment `install` script (`npm ci`). Node 20 is pinned in `.cursor/Dockerfile` to match CI.

### Verify changes

```bash
npm test
```

That builds theme JSON + dist exports, then runs palette/theme checks.

### Useful commands

- `npm run build` — regenerate `themes/`, `zed/themes/`, and `dist/`
- `npm start` — watch `src/` and rebuild on change
- `npm run package` — produce a `.vsix` (gitignored)

### Notes

- Generated outputs under `themes/`, `zed/themes/`, and `dist/` are part of the publish/build flow; prefer editing `src/` and regenerating.
- No app server or database is required for normal theme work.
