import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { DotConfigFile } from './types/index';

async function load(dotconfigPath: string): Promise<[string, DotConfigFile]> {
  try {
    if (path.extname(dotconfigPath) === '.ts') {
      // eslint-disable-next-line import/no-extraneous-dependencies, global-require
      require('ts-node').register();
    }

    // eslint-disable-next-line import/no-dynamic-require, global-require
    const module = require(dotconfigPath);
    if (Object.keys(module).length === 1 && module.default) {
      return [dotconfigPath, module.default];
    }
    return [dotconfigPath, module];
  } catch (error) {
    throw new Error(`dotconfig: Cannot load ${dotconfigPath}: ${(error as Error).message}`);
  }
}

export async function resolveConfig(pkgPath: string, pkgValue?: any) {
  if (typeof pkgValue === 'string') {
    assert(
      fs.existsSync(pkgValue),
      `dotconfig: Cannot find ${pkgValue} as specified in ${pkgPath}/package.json`,
    );
    return load(pkgValue);
  }
  const pkgDir = path.dirname(pkgPath);
  const found = [path.resolve(pkgDir, 'dotconfig.ts'), path.resolve(pkgDir, 'dotconfig.js')].find(
    (f) => fs.existsSync(f),
  );
  assert(found, `Could not find dotconfig.ts or dotconfig.js in ${pkgDir}`);
  return load(found);
}
