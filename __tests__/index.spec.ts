import path from 'path';
import fs from 'fs';
import runCoConfig from '../src/index';
import { resolveConfig } from '../src/resolver';

function clean(content: string) {
  return content.replace(/@version coconfig@[.0-9]+/g, '');
}

async function tryConfig(filename: string, lang: string) {
  // eslint-disable-next-line global-require, import/extensions, import/no-dynamic-require
  const packagePath = path.resolve(__dirname, 'fake/package.json');
  const [coconfigPath, jsConfig] = await resolveConfig(
    packagePath,
    path.resolve(__dirname, filename),
  );
  await runCoConfig(
    {
      packagePath,
      packageJson: {
        name: 'fake',
        version: '1.0.0',
        readme: 'not bloody likely',
        _id: 'eh?',
      },
      coconfigPath,
      verifyGitIgnore: false,
    },
    jsConfig,
  );
  ['big-config.rc', 'not-config.js', '.fakeignore'].forEach((file) => {
    const produced = path.resolve(__dirname, 'fake', file);
    expect(fs.existsSync(produced)).toBe(true);
    expect(clean(fs.readFileSync(produced, 'utf-8'))).toEqual(
      clean(fs.readFileSync(path.resolve(__dirname, 'snapshots', lang, file), 'utf-8')),
    );
    fs.rmSync(produced);
  });
  expect(fs.existsSync(path.resolve(__dirname, 'fake', 'default'))).toBe(false);
}

test('Read a JS coconfig', async () => tryConfig('./fake/coconfig.js', 'js'));
test('Read a TS coconfig', async () => tryConfig('./fake/coconfig.ts', 'ts'));
