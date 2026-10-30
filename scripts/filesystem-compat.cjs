// FAT32 reports EISDIR for readlink on ordinary files. Next.js expects EINVAL.
// Normalize that case only, inside this project, after confirming a non-link.
const fs = require('node:fs');
const path = require('node:path');
const { fileURLToPath } = require('node:url');
const root = path.resolve(__dirname, '..');
const installed = Symbol.for('field-dashboard.readlink-compat');
if (!fs[installed]) {
  fs[installed] = true;
  const lstat = fs.lstatSync.bind(fs);
  function normalize(error, target) {
    if (!error || error.code !== 'EISDIR') return error;
    try {
      const name = target instanceof URL ? fileURLToPath(target) : Buffer.isBuffer(target) ? target.toString() : target;
      const relative = path.relative(root, path.resolve(name));
      if (path.isAbsolute(relative) || relative === '..' || relative.startsWith('..' + path.sep)) return error;
      if (!lstat(target).isSymbolicLink()) {
        error.code = 'EINVAL';
        error.message = 'EINVAL: readlink target is not a symbolic link';
      }
    } catch { /* Preserve the original error if the target cannot be checked. */ }
    return error;
  }
  const readlinkSync = fs.readlinkSync.bind(fs);
  fs.readlinkSync = function(target, options) {
    try { return readlinkSync(target, options); } catch (error) { throw normalize(error, target); }
  };
  const readlink = fs.readlink.bind(fs);
  fs.readlink = function(target, options, callback) {
    if (typeof options === 'function') { callback = options; options = undefined; }
    return readlink(target, options, (error, value) => callback(normalize(error, target), value));
  };
  const promiseReadlink = fs.promises.readlink.bind(fs.promises);
  fs.promises.readlink = async function(target, options) {
    try { return await promiseReadlink(target, options); } catch (error) { throw normalize(error, target); }
  };
}
