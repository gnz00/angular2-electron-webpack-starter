import { getPath } from '../utils';
import lodash      from 'lodash';

const DEBUG = !lodash.includes(process.argv, '--release');
const VERBOSE = lodash.includes(process.argv, '--verbose');

const base = {
  target: 'electron-main',

  entry: {
    main: getPath('src/electron/main.js')
  },

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

  resolve: {
    extensions: ['', '.js'],
    root: getPath('src/electron'),
    modulesDirectories: ['node_modules'],
  },

  externals: [
    /^[a-z\-0-9]+$/
  ],

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }, {
        test: /\.json$/,
        loader: 'json-loader',
      }, {
        test: /\.txt$/,
        loader: 'raw-loader',
      }
    ],
  }
}


export function getElectronConfig(env) {
  const config = require(`./webpack.${env}.js`);

  return Object.assign(base, config);
}

export default getElectronConfig(process.env.NODE_ENV || 'development');