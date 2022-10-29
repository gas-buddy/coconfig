import type { NormalizedPackageJson } from 'read-pkg-up';

export interface DotConfigEnvironment {
  packageJson: NormalizedPackageJson;
  packagePath: string;
  dotconfigPath: string;
  // Whether to verify that the produced files are gitignored (default: true)
  verifyGitIgnore?: boolean;
  modifyGitIgnore?: boolean;
}

export type DotConfigExecutionFn = (env: DotConfigEnvironment) => (string | Promise<string>);

export interface DotConfigBaseEntry {
  // Will be taken from the key in the dotconfig object if not passed
  filename?: string | DotConfigExecutionFn;
}

// If you just want to control the contents of the file (e.g. a text file like .eslintignore)
// use a DotConfigLiteralEntry
export interface DotConfigLiteralEntry extends DotConfigBaseEntry {
  content: string | DotConfigExecutionFn;
  encoding?: BufferEncoding;
}

// If you want the result of your function to be passed to the upstream target,
// such as an .eslintrc.js, use a DotConfigPassthroughEntry. What we will actually
// write to the file is a require of your dotconfig, and then an export of the result
// of calling the function in your dotconfig. PLEASE NOTE: This means you should generally
// not execute top-level code in your dotconfig, as it would run on every require of that file.
export interface DotConfigPassthroughEntry extends DotConfigBaseEntry {
  configuration: () => any | Record<string, any>;
}

export type DotConfig = Record<string, string | DotConfigLiteralEntry | DotConfigPassthroughEntry>;

export type DotConfigFile = DotConfig | ((env: DotConfigEnvironment) => DotConfig);
