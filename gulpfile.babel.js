import gulp                 from 'gulp';
import webpack              from 'webpack';
import path                 from 'path';
import os                   from 'os';
import packager             from 'electron-packager';
import del                  from 'del';
import yargs                from 'yargs';
import { exec }             from 'child_process';
import gutil                from 'gutil';
import pkg                  from './package.json';
import { getConfigs }       from './webpack';
import colorsSupported      from 'supports-color';

const deps = Object.keys(pkg.dependencies);
const devDeps = Object.keys(pkg.devDependencies);

gulp.task('clean:build', (cb) => {
  del('dist/*')
  .then(() =>{
    cb();
  })
  .catch((err) => {
    gutil.log(err);
  })
});

// Build a webpack config
gulp.task('build:all', ['clean:build'], (cb) => {
  const configMap = getConfigs(getEnv());
  const buildPromises = [];
  for (let config of Object.keys(configMap)) {
    buildPromises.push(
      bundle(configMap[config])
    );
  }

  Promise.all(buildPromises)
  .then((results) => {
    cb();
  })
  .catch((err) => {
    gutil.log(err);
  })
});

gulp.task('build', [], (cb) => {
  const config = path.resolve(__dirname, yargs.argv.config);
  bundle(require(config))
  .then((stats) => {
    cb();
  })
  .catch((err) => {
    gutil.log(err);
  })
});

function getEnv() {
  return yargs.argv.env || process.env.NODE_ENV || 'development';
}

function bundle(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err)  {
        reject(new gutil.PluginError("webpack", err));
      }

      gutil.log("[webpack]", stats.toString({
        colors: colorsSupported,
        chunks: false,
        errorDetails: true
      }));

      resolve(stats);
    });
  })
}