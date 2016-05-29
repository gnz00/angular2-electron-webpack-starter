import path         from 'path';
import webpack      from 'webpack';
import { getPath }  from '../utils';
import webpackMerge from 'webpack-merge';

import HtmlWebpackPlugin      from 'html-webpack-plugin';
import CopyWebpackPlugin      from 'copy-webpack-plugin';
import { ForkCheckerPlugin }  from 'awesome-typescript-loader';
import lodash                 from 'lodash';

const DEBUG = !lodash.includes(process.argv, '--release');
const VERBOSE = lodash.includes(process.argv, '--verbose');

// Constants
const METADATA = {
  title: 'Jasmine Output Parser',
  baseUrl: '/'
};

const base = {
  target: 'electron-renderer',
  entry: {
    'polyfills': [getPath('src/client/polyfills.ts')],
    'vendor': [getPath('src/client/vendor.ts')],
    'app': [getPath('src/client/app.browser.ts')]
  },

  cache: DEBUG,
  debug: DEBUG,

  stats: {
    assets: VERBOSE,
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

  metadata: METADATA,

  resolve: {
    extensions: ['', '.ts', '.js'],
    root: getPath('src/client'),
    modulesDirectories: ['node_modules'],
    alias: {
      // legacy imports pre-rc releases
      'angular2': getPath('node_modules/@angularclass/angular2-beta-to-rc-alias/dist/beta-17')
    }
  },

  node: {
    global: 'window',
    crypto: 'empty',
    module: false,
    clearImmediate: false,
    setImmediate: false
  },

  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [
          // these packages have problems with their sourcemaps
          getPath('node_modules/rxjs'),
          getPath('node_modules/@angular'),
        ]
      }
    ],
    loaders: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader',
        exclude: [/\.(spec|e2e)\.ts$/]
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.css$/,
        loader: 'raw-loader'
      },
      {
        test: /\.html$/,
        loader: 'raw-loader',
        exclude: [getPath('src/client/index.html')]
      }
    ]
  },

  /* Plugins */
  plugins: [

    new ForkCheckerPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(true),

    new webpack.optimize.CommonsChunkPlugin({
      name: ['polyfills', 'vendor'].reverse()
    }),

    new CopyWebpackPlugin([{
      from: getPath('src/client/assets'),
      to: 'assets'
    }]),

    new HtmlWebpackPlugin({
      template: getPath('src/client/index.html'),
      chunksSortMode: 'dependency'
    })

  ]
};

export function getClientConfig(env) {
  const config = require(`./webpack.${env}.js`);

  return webpackMerge(base, config);
}

export default getClientConfig(process.env.NODE_ENV || 'development');