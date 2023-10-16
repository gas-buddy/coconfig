import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { CoConfigFile } from './types/index';

function getExport(module: Record<string, unknown>) {
  if (Object.keys(module).length === 1 && (module.default || module.config)) {
    return module.default || module.config;
  }
  if (
    Object.keys(module).length === 2
    && module.default
    && module.config
    && module.default === module.config
  ) {
    return module.default;
  }
  return module;
}

async function load(coconfigPath: string): Promise<{ coconfigPath: string; config: CoConfigFile }> {
  try {
    if (path.extname(coconfigPath) === '.ts') {
      // eslint-disable-next-line import/no-extraneous-dependencies, global-require
      require('ts-node').register();
    }

    // eslint-disable-next-line import/no-dynamic-require, global-require
    const module = require(coconfigPath);
    return { coconfigPath, config: getExport(module) as CoConfigFile };
  } catch (error) {
    throw new Error(`coconfig: Cannot load ${coconfigPath}: ${(error as Error).message}`);
  }
}

export async function resolveConfig(pkgPath: string, pkgValue?: any) {
  if (typeof pkgValue === 'string') {
    if (pkgValue.startsWith('.')) {
      return load(path.resolve(path.dirname(pkgPath), pkgValue));
    }
    if (!fs.existsSync(pkgValue)) {
      // By default, npx/yarn dlx does not have access to the running package's node_modules,
      // but we need that so that we don't have to be a runtime dep, but can work in runtime
      // build scripts (after dev packages have been removed).
      module.paths.push(path.resolve(path.dirname(pkgPath), 'node_modules'));
      // Perhaps this is a node module?
      try {
        const nodemodule = await load(pkgValue);
        return nodemodule;
      } catch (error) {
        // Nope.
      }
    }
    assert(fs.existsSync(pkgValue), `coconfig: Cannot find ${pkgValue} as specified in ${pkgPath}`);
    return load(pkgValue);
  }
  const pkgDir = path.dirname(pkgPath);
  const found = [path.resolve(pkgDir, 'coconfig.ts'), path.resolve(pkgDir, 'coconfig.js')].find(
    (f) => fs.existsSync(f),
  );
  assert(found, `Could not find coconfig.ts or coconfig.js in ${pkgDir}`);
  return load(found);
}
