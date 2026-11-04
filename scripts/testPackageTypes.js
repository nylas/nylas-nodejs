const path = require('node:path');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const fixtures = ['package.cts', 'package.mts'].map((filename) =>
  path.join(root, 'tests', 'types', filename)
);
const configurations = [
  [ts.ModuleKind.Node16, ts.ModuleResolutionKind.Node16],
  [ts.ModuleKind.NodeNext, ts.ModuleResolutionKind.NodeNext],
  [ts.ModuleKind.Preserve, ts.ModuleResolutionKind.Bundler],
];

let failed = false;
for (const [module, moduleResolution] of configurations) {
  const program = ts.createProgram(fixtures, {
    module,
    moduleResolution,
    target: ts.ScriptTarget.ES2022,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    // formdata-node has a transitive CJS/ESM declaration conflict in Node16.
    // Check our declarations fully with NodeNext and Bundler.
    skipLibCheck: moduleResolution === ts.ModuleResolutionKind.Node16,
    types: ['node'],
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length > 0) {
    failed = true;
    console.error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (filename) => filename,
        getCurrentDirectory: () => root,
        getNewLine: () => '\n',
      })
    );
  }
}

if (failed) {
  process.exitCode = 1;
}
