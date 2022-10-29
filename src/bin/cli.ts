// Run with yarn dlx dotconfig or npx dotconfig
import assert from 'assert';
import minimist from 'minimist';
import readPkgUp from 'read-pkg-up';
import runDotConfig from '../index';
import { resolveConfig } from '../resolver';
import type { DotConfigEnvironment } from '../types/index';

const argv = minimist(process.argv.slice(2), {
  default: { gitignore: true, 'modify-git-ignore': true },
  boolean: ['normalize', 'gitignore', 'modify-git-ignore'],
});

async function run() {
  const pkgInfo = readPkgUp.sync({ cwd: argv.cwd, normalize: argv.normalize });
  assert(pkgInfo, 'Cannot find package.json. Pass cwd option that points to a directory with a package.json');
  const { packageJson, path } = pkgInfo;
  const [dotconfigPath, dotconfig] = await resolveConfig(path, packageJson.config?.dotconfig);

  const dotconfigEnv: DotConfigEnvironment = {
    packageJson,
    packagePath: path,
    dotconfigPath,
    verifyGitIgnore: argv.gitignore,
    modifyGitIgnore: argv['modify-git-ignore'],
  };

  let finalConfig = dotconfig;
  if (typeof dotconfig === 'function') {
    finalConfig = await dotconfig(dotconfigEnv);
  }
  await runDotConfig(dotconfigEnv, finalConfig);
}

run();
