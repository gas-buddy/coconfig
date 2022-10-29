const npmIgnore = `
# npmignore should match gitignore, except for the /build directory
# Custom
.transpiled
.nyc_output
.yarnrc.yml
.yarn
# Normally I would include this, but since we're trying to stay small...
__tests__
.github

# Stock
*.seed
*.log
*.csv
*.dat
*.out
*.pid
*.gz
*.orig

work
pids
logs
results
coverage
lib-cov
html-report
xunit.xml
node_modules
npm-debug.log

.project
.idea
.settings
.iml
*.sublime-workspace
*.sublime-project

.DS_Store*
ehthumbs.db
Icon?
Thumbs.db
.AppleDouble
.LSOverride
.Spotlight-V100
.Trashes
`;

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const jestConfig = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '(\\.|/)(test|spec)\\.[jt]sx?$',
};

export default {
  '.npmignore': npmIgnore,
  '.eslintignore': {
    content: `build/
coverage
jest.config.js
.eslintrc.js
src/generated
__tests__/snapshots
__tests__/fake/coconfig.js`,
  },
  '.eslintrc.js': {
    configuration: () => ({
      root: true,
      extends: 'gasbuddy',
      parserOptions: {
        project: './tsconfig.json',
      },
    }),
  },
  'jest.config.js': {
    configuration: jestConfig,
  },
  '.prettierrc.js': {
    configuration: {
      bracketSpacing: true,
      bracketSameLine: true,
      singleQuote: true,
      trailingComma: 'all',
      // A person has his limits, and 80 is not it.
      printWidth: 100,
      overrides: [
        {
          files: '*.js',
          options: {
            parser: 'babel',
          },
        },
      ],
    },
  },
};
