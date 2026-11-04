Run the packed SDK end-to-end suite with:

```sh
npm run test:e2e
```

The runner builds the SDK, creates an npm tarball, installs it into a temporary
consumer project, and tests the installed package against local HTTP servers.
CommonJS and ESM consumer programs are compiled and executed from that project.
No Nylas credentials are required. Installation scripts are disabled, and the
temporary project is removed after the run.

These tests use Node's built-in test runner and native HTTP/fetch behavior. Jest
excludes this directory so its fetch mocks cannot affect these checks. The pull
request workflow runs the suite on every supported Node.js version in its matrix.
