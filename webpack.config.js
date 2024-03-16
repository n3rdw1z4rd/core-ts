const DEV = (process.env.NODE_ENV !== 'production');
const PKG = require('./package.json');
const CONF = (DEV ? './webpack/webpack.dev.config' : './webpack/webpack.prod.config');

const config = require(CONF)(DEV, PKG);

console.log(JSON.stringify(config, null, 2));

module.exports = config;