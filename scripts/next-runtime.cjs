const preload = require.resolve('./filesystem-compat.cjs');
require(preload);
// Build workers and the development child process need the same compatibility.
process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --require "${preload.replace(/\\/g, '/')}"`;
require('next/dist/bin/next');
