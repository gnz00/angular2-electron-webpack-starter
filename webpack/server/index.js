import { getPath } from '../utils';
import lodash      from 'lodash';

const DEBUG = !lodash.includes(process.argv, '--release');
const VERBOSE = lodash.includes(process.argv, '--verbose');

const base = {
  target: 'node',

  cache: DEBUG,
  debug: DEBUG,

  stats: {
    assets: false,
    colors: true,
    reasons: DEBUG,
    hash: VERBOSE,
    version: VERBOSE,
    timings: true,
    chunks: VERBOSE,
    chunkModules: VERBOSE,
    cached: VERBOSE,
    cachedAssets: VERBOSE,
  },

  node: {
    __filename: true,
    __dirname: true
  },

  entry: {
    main: getPath('src/server/server.js')
  },

  resolve: {
    extensions: ['', '.js'],
    root: getPath('src/server'),
    modulesDirectories: ['node_modules'],
  },

  externals: [
    /^[a-z\-0-9]+$/
  ]
}

export function getServerConfig(env) {
  const config = require(`./webpack.${env}.js`);

  return Object.assign(base, config);
}

export default getServerConfig(process.env.NODE_ENV || 'development');