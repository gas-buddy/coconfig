import fs from 'fs';
import path from 'path';
import type { CoConfig } from '../../src';

const config: CoConfig = {
  '.fakeignore': {
    content: `This is the fakeignore file
It has some random lines`,
  },
  '.justtext': 'this is just a string',
  'not-config': {
    filename: 'not-config.js',
    configuration() {
      return {
        verbose: true,
        preset: 'ts-jest',
        testEnvironment: 'node',
        testRegex: '(\\.|/)(test|spec)\\.[jt]sx?$',
      };
    },
  },
  'big-config.rc': {
    async content() {
      return fs.promises.readFile(path.resolve(__dirname, 'datasource.txt'), 'utf-8');
    },
  },
};

export default config;
