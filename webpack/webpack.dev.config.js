const HtmlWebpackPlugin = require('html-webpack-plugin');
const { resolve } = require('path');

module.exports = (DEV, PKG) => {
    const common = require('./webpack.common.config')(DEV, PKG);

    return {
        ...common,
        mode: 'development',
        // devtool: 'eval-cheap-source-map',
        entry: resolve(__dirname, '../test/index.ts'),
        plugins: [
            ...common.plugins,
            new HtmlWebpackPlugin({
                inject: true,
                title: 'core-ts | development',
            }),
        ],
        devServer: {
            host: '0.0.0.0',
            port: 3000,
            hot: true,
        },
    };
};