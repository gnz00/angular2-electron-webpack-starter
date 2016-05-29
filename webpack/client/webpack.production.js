import path           from 'path';
import webpack        from 'webpack';
import { getPath } from '../utils';

// Plugins
import DefinePlugin       from 'webpack/lib/DefinePlugin';
import ProvidePlugin      from 'webpack/lib/ProvidePlugin';
import DedupePlugin       from 'webpack/lib/optimize/DedupePlugin';
import UglifyJsPlugin     from 'webpack/lib/optimize/UglifyJsPlugin';
import CompressionPlugin  from 'compression-webpack-plugin';
import WebpackMd5Hash     from 'webpack-mdf-hash';

// Constants
const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;
const METADATA = {
  host: HOST,
  port: PORT,
  ENV: ENV,
  HMR: false
};

export default {
  target: 'electron-renderer',

  cache: false,
  debug: false,
  devtool: 'source-map',

  output: {
    path: getPath('dist/client'),
    filename: '[name].[chunkhash].bundle.js',
    sourceMapFilename: '[name].[chunkhash].bundle.map',
    chunkFilename: '[id].[chunkhash].chunk.js'
  },

  plugins: [
    new WebpackMd5Hash(),
    new DedupePlugin(),

    // NOTE: when adding more properties make sure you include them in custom-typings.d.ts
    new DefinePlugin({
      'ENV': JSON.stringify(METADATA.ENV),
      'HMR': METADATA.HMR,
      'process.env': {
        'ENV': JSON.stringify(METADATA.ENV),
        'NODE_ENV': JSON.stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
      }
    }),

    // NOTE: To debug prod builds uncomment //debug lines and comment //prod lines
    new UglifyJsPlugin({
      // beautify: true, //debug
      // mangle: false, //debug
      // dead_code: false, //debug
      // unused: false, //debug
      // deadCode: false, //debug
      // compress: {
      //   screw_ie8: true,
      //   keep_fnames: true,
      //   drop_debugger: false,
      //   dead_code: false,
      //   unused: false
      // }, // debug
      // comments: true, //debug

      beautify: false, //prod

      mangle: {
        screw_ie8 : true,
        keep_fnames: true
      }, //prod

      compress: {
        screw_ie8: true
      }, //prod

      comments: false //prod
    }),

    new CompressionPlugin({
      regExp: /\.css$|\.html$|\.js$|\.map$/,
      threshold: 2 * 1024
    }),

  ],

  tslint: {
    emitErrors: true,
    failOnHint: true,
    resourcePath: 'src/client'
  },

  // TODO: Need to workaround Angular 2's html syntax => #id [bind] (event) *ngFor
  htmlLoader: {
    minimize: true,
    removeAttributeQuotes: false,
    caseSensitive: true,
    customAttrSurround: [
      [/#/, /(?:)/],
      [/\*/, /(?:)/],
      [/\[?\(?/, /(?:)/]
    ],
    customAttrAssign: [/\)?\]?=/]
  }
};
