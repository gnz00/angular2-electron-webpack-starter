import path from 'path';
import webpack from 'webpack';
import { getPath, hasProcessFlag } from '../utils';

// Plugins
import DefinePlugin from 'webpack/lib/DefinePlugin';

// Constants
const ENV = process.env.NODE_ENV = process.env.ENV = 'development';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 1776;
const METADATA = {
  host: HOST,
  port: PORT,
  ENV: ENV,
  HMR: true
};

const hmrEntry = `webpack-hot-middleware/client?path=https://${HOST}:${PORT}/__webpack_hmr`;

export default {
  // Append the webpack-hot-middleware entrypoint
  entry: {
    'polyfills': [hmrEntry, getPath('src/client/polyfills.ts')],
    'vendor': [hmrEntry, getPath('src/client/vendor.ts')],
    'app': [hmrEntry, getPath('src/client/app.browser.ts')]
  },

  metadata: METADATA,
  devtool: 'cheap-module-source-map',

  output: {
    path: getPath('dist/client'),
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].map',
    chunkFilename: '[id].chunk.js',
  },

  plugins: [
    // NOTE: when adding more properties, make sure you include them in custom-typings.d.ts
    new DefinePlugin({
      'ENV': JSON.stringify(METADATA.ENV),
      'HMR': METADATA.HMR,
      'process.env': {
        'ENV': JSON.stringify(METADATA.ENV),
        'NODE_ENV': JSON.stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
      }
    }),

    new webpack.HotModuleReplacementPlugin()
  ],
  
  tslint: {
    emitErrors: false,
    failOnHint: false,
    resourcePath: 'src/client'
  }
};
