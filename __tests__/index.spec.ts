import path from 'path';
import fs from 'fs';
import runDotConfig from '../src/index';
import { resolveConfig } from '../src/resolver';

async function tryConfig(filename: string, lang: string) {
  // eslint-disable-next-line global-require, import/extensions, import/no-dynamic-require
  const packagePath = path.resolve(__dirname, 'fake/package.json');
  const [dotconfigPath, jsConfig] = await resolveConfig(
    packagePath,
    path.resolve(__dirname, filename),
  );
  await runDotConfig(
    {
      packagePath,
      packageJson: {
        name: 'fake',
        version: '1.0.0',
        readme: 'not bloody likely',
        _id: 'eh?',
      },
      dotconfigPath,
      verifyGitIgnore: false,
    },
    jsConfig,
  );
  ['big-config.rc', 'not-config.js', '.fakeignore'].forEach((file) => {
    const produced = path.resolve(__dirname, 'fake', file);
    expect(fs.existsSync(produced)).toBe(true);
    expect(fs.readFileSync(produced, 'utf-8')).toEqual(
      fs.readFileSync(path.resolve(__dirname, 'snapshots', lang, file), 'utf-8'),
    );
    fs.rmSync(produced);
  });
  expect(fs.existsSync(path.resolve(__dirname, 'fake', 'default'))).toBe(false);
}

test('Read a JS dotconfig', async () => tryConfig('./fake/dotconfig.js', 'js'));
test('Read a TS dotconfig', async () => tryConfig('./fake/dotconfig.ts', 'ts'));
