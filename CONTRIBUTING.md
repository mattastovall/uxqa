# Contributing to uxqa

Use Node.js 22 and npm. Fork the repository, create a focused branch, and install dependencies with `npm ci`.

Before opening a pull request, run:

```sh
npm run lint
npm run typecheck
npm test -- --run
npm run build
npm run test:e2e
```

Keep React and React DOM as peer dependencies, import the demo package only through `uxqa` public exports, and prefix new library CSS selectors with `uxqa-`. Add tests for public behavior and types whenever the API changes.

Releases use the manual process documented in the README. Maintainers update the changelog and version, run the complete verification suite, then publish after reviewing the packed tarball.
