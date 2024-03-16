const { resolve } = require('path');

module.exports = (DEV, PKG) => {
    const common = require('./webpack.common.config')(DEV, PKG);

    return {
        ...common,
        mode: 'production',
        entry: resolve(__dirname, '../src/index.ts'),
    };
};