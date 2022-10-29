import type { NormalizedPackageJson } from 'read-pkg-up';

export interface CoConfigEnvironment {
  packageJson: NormalizedPackageJson;
  packagePath: string;
  coconfigPath: string;
  // Whether to verify that the produced files are gitignored (default: true)
  verifyGitIgnore?: boolean;
  modifyGitIgnore?: boolean;
}

export type CoConfigExecutionFn = (env: CoConfigEnvironment) => (string | Promise<string>);

export interface CoConfigBaseEntry {
  // Will be taken from the key in the coconfig object if not passed
  filename?: string | CoConfigExecutionFn;
}

// If you just want to control the contents of the file (e.g. a text file like .eslintignore)
// use a CoConfigLiteralEntry
export interface CoConfigLiteralEntry extends CoConfigBaseEntry {
  content: string | CoConfigExecutionFn;
  encoding?: BufferEncoding;
}

// If you want the result of your function to be passed to the upstream target,
// such as an .eslintrc.js, use a CoConfigPassthroughEntry. What we will actually
// write to the file is a require of your coconfig, and then an export of the result
// of calling the function in your coconfig. PLEASE NOTE: This means you should generally
// not execute top-level code in your coconfig, as it would run on every require of that file.
export interface CoConfigPassthroughEntry extends CoConfigBaseEntry {
  configuration: () => any | Record<string, any>;
  // If you want the function to run at "build time" and just render the json,
  // set this value to true. This is commonly used for tsconfig.json, which
  // is useful to keep as an object for upstream manipulation, but needs to be
  // JSON in the end.
  stringify?: boolean;
}

export type CoConfig = Record<string, string | CoConfigLiteralEntry | CoConfigPassthroughEntry>;

export type CoConfigFile = CoConfig | ((env: CoConfigEnvironment) => CoConfig);
