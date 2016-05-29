import path from 'path';
import webpack from 'webpack';
import { getPath } from '../utils';
import webpackMerge from 'webpack-merge';

// Plugins
import DefinePlugin from 'webpack/lib/DefinePlugin';

// Constants
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';

export default {
  devtool: 'cheap-module-source-map',

  output: {
    path: getPath('dist/electron'),
    filename: '[name].js',
    sourceMapFilename: '[name].map',
    chunkFilename: '[id].chunk.js',
    libraryTarget: 'commonjs2'
  },

  plugins: [
    // NOTE: when adding more properties, make sure you include them in custom-typings.d.ts
    new DefinePlugin({
      'ENV': JSON.stringify(ENV),
      'process.env': {
        'ENV': JSON.stringify(ENV),
        'NODE_ENV': JSON.stringify(ENV)
      }
    })
  ]
};
