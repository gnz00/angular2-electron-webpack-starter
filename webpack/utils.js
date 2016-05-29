import path from 'path';

const ROOT_DIR = path.resolve(__dirname, '../');

export function hasProcessFlag(flag) {
  return process.argv.join('').indexOf(flag) > -1;
}

export function getPath(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [ROOT_DIR].concat(args));
}
