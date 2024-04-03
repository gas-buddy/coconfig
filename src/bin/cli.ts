#!/usr/bin/env node
// Run with yarn dlx coconfig or npx coconfig
import assert from 'assert';
import minimist from 'minimist';
import readPkgUp from 'read-pkg-up';
import runCoConfig from '../index';
import { resolveConfig } from '../resolver';
import type { CoConfigEnvironment } from '../types/index';

const isDev = (process.env.NODE_ENV || 'development') === 'development';
const argv = minimist(process.argv.slice(2), {
  default: {
    // Don't check/modify in non-dev mode
    gitignore: isDev,
    'modify-git-ignore': isDev,
  },
  boolean: ['normalize', 'gitignore', 'modify-git-ignore'],
});

async function run() {
  const pkgInfo = readPkgUp.sync({ cwd: argv.cwd, normalize: argv.normalize });
  assert(
    pkgInfo,
    'Cannot find package.json. Pass cwd option that points to a directory with a package.json',
  );
  const { packageJson, path } = pkgInfo;
  const pkgValue = packageJson.config?.coconfig as string | undefined;
  const { coconfigPath, config } = await resolveConfig(path, pkgValue);

  const coconfigEnv: CoConfigEnvironment = {
    packageJson,
    packagePath: path,
    coconfigPath,
    verifyGitIgnore: argv.gitignore,
    modifyGitIgnore: argv['modify-git-ignore'],
  };

  let finalConfig = config;
  if (typeof config === 'function') {
    finalConfig = await config(coconfigEnv);
  }
  await runCoConfig(coconfigEnv, finalConfig);
}

run().catch((error) => {
  console.error(`coconfig failed ${error.message}\n`);
  console.error(error);
  process.exit(-1);
});
