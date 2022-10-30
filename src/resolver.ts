import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { CoConfigFile } from './types/index';

async function load(coconfigPath: string): Promise<[string, CoConfigFile]> {
  try {
    if (path.extname(coconfigPath) === '.ts') {
      // eslint-disable-next-line import/no-extraneous-dependencies, global-require
      require('ts-node').register();
    }

    // eslint-disable-next-line import/no-dynamic-require, global-require
    const module = require(coconfigPath);
    if (Object.keys(module).length === 1 && module.default) {
      return [coconfigPath, module.default];
    }
    return [coconfigPath, module];
  } catch (error) {
    throw new Error(`coconfig: Cannot load ${coconfigPath}: ${(error as Error).message}`);
  }
}

export async function resolveConfig(pkgPath: string, pkgValue?: any) {
  if (typeof pkgValue === 'string') {
    if (!fs.existsSync(pkgValue)) {
      // Perhaps this is a node module?
      try {
        const nodemodule = await load(pkgValue);
        return nodemodule;
      } catch (error) {
        // Nope.
      }
    }
    assert(
      fs.existsSync(pkgValue),
      `coconfig: Cannot find ${pkgValue} as specified in ${pkgPath}`,
    );
    return load(pkgValue);
  }
  const pkgDir = path.dirname(pkgPath);
  const found = [path.resolve(pkgDir, 'coconfig.ts'), path.resolve(pkgDir, 'coconfig.js')].find(
    (f) => fs.existsSync(f),
  );
  assert(found, `Could not find coconfig.ts or coconfig.js in ${pkgDir}`);
  return load(found);
}
