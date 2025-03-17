/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import findUp from 'find-up';
import makeDir from 'make-dir';
import dotgitignore from 'dotgitignore';
import { CoConfigEnvironment, CoConfigExecutionFn, CoConfigFile } from './types/index';
import { getFile, headerMarker } from './passthrough';

export default async function runCoConfig(env: CoConfigEnvironment, coconfig: CoConfigFile) {
  const configs = Object.entries(coconfig);
  const filebase = path.dirname(env.packagePath);

  async function resolveFilename(f: string | CoConfigExecutionFn) {
    if (typeof f === 'string') {
      return path.resolve(filebase, f);
    }
    const filenameFromFunction = await f(env);
    return path.resolve(filebase, filenameFromFunction);
  }

  let gitignore: ReturnType<typeof dotgitignore> | undefined;

  async function writeIfNecessary({
    filename,
    content,
    encoding,
    checkFirst,
  }: {
    filename: string;
    content?: string;
    encoding?: BufferEncoding;
    checkFirst?: boolean;
  }) {
    const existing = fs.existsSync(filename)
      ? await fs.promises.readFile(filename, encoding)
      : undefined;
    if (content !== undefined && content !== existing) {
      if (checkFirst && existing && !existing.includes(headerMarker)) {
        console.warn(
          `coconfig: ${filename} already exists, but was not created by coconfig. Skipping.`,
        );
        return;
      }
      makeDir.sync(path.dirname(filename));
      await fs.promises.writeFile(filename, content, { encoding });
      if (env.verifyGitIgnore) {
        gitignore = gitignore || dotgitignore();
        if (!gitignore.ignore(filename)) {
          if (env.modifyGitIgnore) {
            const rawFilePath =
              findUp.sync('.gitignore', { cwd: filebase }) || path.resolve(filebase, '.gitignore');
            let exIgnore = fs.existsSync(rawFilePath)
              ? fs.readFileSync(rawFilePath || '', 'utf8').trimEnd()
              : '';
            if (!exIgnore.includes('# Added by coconfig')) {
              exIgnore = `${exIgnore}\n# Added by coconfig`;
            }
            const update = `${exIgnore}\n${path.relative(filebase, filename)}\n`;
            fs.writeFileSync(rawFilePath, update, { encoding: 'utf8' });
          } else {
            console.warn(
              `coconfig: ${path.relative(
                filebase,
                filename,
              )} is not ignored by .gitignore. Please add it to .gitignore since it is a generated file`,
            );
          }
        }
      }
    }
  }

  await configs.reduce((promise, [name, entry]) => {
    if (name.startsWith('__') && typeof entry !== 'object') {
      // Cruft, like __esmodule
      return promise;
    }
    if (typeof entry === 'string') {
      return promise
        .then(() => resolveFilename(name))
        .then((filename) =>
          writeIfNecessary({
            filename,
            content: entry,
            encoding: 'utf8',
          }),
        );
    }
    const filenamePromise = resolveFilename(entry.filename || name);
    if ('content' in entry) {
      const { encoding, content } = entry;
      return promise
        .then(() => filenamePromise)
        .then(async (filename) => {
          if (typeof content === 'string') {
            return { filename, content, encoding };
          }
          return { filename, content: await content(env), encoding };
        })
        .then(writeIfNecessary);
    }
    if ('stringify' in entry && entry.stringify) {
      return promise
        .then(() => filenamePromise)
        .then(async (filename) => {
          const { configuration } = entry;
          const jsObject =
            typeof configuration === 'function' ? await configuration(env) : configuration;
          return writeIfNecessary({
            filename,
            content: JSON.stringify(jsObject, null, '  '),
            encoding: 'utf8',
          });
        });
    }
    return promise
      .then(() => filenamePromise)
      .then((filename) =>
        writeIfNecessary({
          filename,
          content: getFile(env, name, filename),
          encoding: 'utf8',
          checkFirst: true,
        }),
      );
  }, Promise.resolve());
}

export * from './types';
