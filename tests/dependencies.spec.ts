import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const { loadNycConfig } = require('@istanbuljs/load-nyc-config');

it('loads coverage YAML configuration with the patched js-yaml dependency', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'nylas-coverage-config-'));
  try {
    writeFileSync(
      join(directory, '.nycrc.yml'),
      'all: true\ninclude:\n  - src/**/*.ts\nreporter:\n  - text\n'
    );
    const config = await loadNycConfig({ cwd: directory });
    expect(config.all).toBe(true);
    expect(config.include).toEqual(['src/**/*.ts']);
    expect(config.reporter).toEqual(['text']);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
