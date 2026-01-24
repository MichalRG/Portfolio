# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the Angular application source, including `main.ts`, feature modules, and shared components.
- `src/assets/` holds static assets (images, icons) referenced by the app.
- `src/pl/` provides the Polish index variant used by language-specific builds.
- `dist/` is the build output directory (generated).
- `scripts/` hosts build helpers, including `add-csp-nonce.js` executed after builds.
- `docs/` stores project documentation.

## Build, Test, and Development Commands
- `npm run start`: runs the dev server (`ng serve`) with the development configuration.
- `npm run build`: production build to `dist/portfolio-website`.
- `npm run build:watch`: development build that rebuilds on changes.
- `npm run test`: runs Karma + Jasmine once in headless Chrome.
- `npm run test:watch`: runs tests in watch mode.
- `npm run lint` / `npm run lint:fix`: run ESLint (with Prettier rules) and optionally auto-fix.

## Coding Style & Naming Conventions
- Indentation: 2 spaces (see `.editorconfig`).
- TypeScript: single quotes preferred; SCSS is the default component style.
- Linting: ESLint with `@angular-eslint` and `@typescript-eslint`; Prettier is enforced as errors.
- Filenames: standard Angular conventions (e.g., `feature-name.component.ts`, `feature-name.service.ts`).

## Testing Guidelines
- Frameworks: Jasmine + Karma via `ng test`.
- Naming: spec files use `*.spec.ts`.
- Browser: `ChromeHeadlessNoSandbox` is configured for CI-friendly runs.

## Commit & Pull Request Guidelines
- Commit messages in history often use uppercase type prefixes (e.g., `FEAT:`, `CHORE:`, `REFACTOR:`). Use concise, imperative summaries.
- PRs should include a clear description of changes, relevant context, and screenshots for UI changes. Link related issues when applicable.
- A pre-push hook runs `npm run lint`; ensure lint passes before pushing.

## Configuration Tips
- Build targets include language-specific configurations (`en`, `pl`) defined in `angular.json`.
- The `postbuild` script injects a CSP nonce into the output, so avoid manual edits in `dist/`.
