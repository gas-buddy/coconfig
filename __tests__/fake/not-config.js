/**
 * This file is generated by coconfig. Do not edit it directly.
 * Instead, edit the coconfig.js or coconfig.ts file in your project root.
 *
 * See https://github.com/gas-buddy/coconfig for more information.
 * @version coconfig@0.6.3
 */
require('ts-node').register();
const config = require('./coconfig').default['not-config'].configuration;

module.exports = typeof config === 'function' ? config() : config;
