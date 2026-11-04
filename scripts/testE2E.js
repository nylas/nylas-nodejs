const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    ...options,
  });
  if (result.error || result.status !== 0) {
    throw new Error('End-to-end test command failed.');
  }
  return result.stdout;
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nylas-sdk-e2e-'));
try {
  run(npm, ['run', 'build']);
  const packed = JSON.parse(
    run(
      npm,
      ['pack', '--ignore-scripts', '--json', '--pack-destination', tempDir],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }
    )
  );
  const filename = packed[0]?.filename;
  if (typeof filename !== 'string' || path.basename(filename) !== filename) {
    throw new Error('Unable to locate the packed SDK artifact.');
  }

  const consumerDir = path.join(tempDir, 'consumer');
  fs.mkdirSync(consumerDir);
  fs.writeFileSync(
    path.join(consumerDir, 'package.json'),
    JSON.stringify({ name: 'nylas-e2e-consumer', private: true })
  );
  run(
    npm,
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--package-lock=false',
      '--loglevel=error',
      path.join(tempDir, filename),
    ],
    { cwd: consumerDir }
  );

  const testsDir = path.join(root, 'tests', 'e2e');
  const tests = fs
    .readdirSync(testsDir)
    .filter((name) => name.endsWith('.test.cjs'))
    .sort()
    .map((name) => path.join(testsDir, name));
  if (tests.length === 0) {
    throw new Error('No end-to-end tests found.');
  }
  process.stdout.write(
    `Running packed SDK end-to-end tests on ${process.version}\n`
  );
  run(process.execPath, ['--test', ...tests], {
    env: { ...process.env, NYLAS_E2E_CONSUMER_DIR: consumerDir },
  });
} catch {
  console.error('Packed SDK end-to-end checks failed.');
  process.exitCode = 1;
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
