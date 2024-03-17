const { resolve } = require('path');

module.exports = (DEV, PKG) => {
    console.log(`*** ${PKG.name} - v${PKG.version} - ${DEV ? 'DEVELOPMENT' : 'PRODUCTION'} ***\n`);

    return {
        stats: 'minimal',
        devtool: 'inline-source-map',
        output: {
            filename: 'index.js',
            path: resolve(__dirname, '../dist'),
            clean: true,
            globalObject: 'this',
            library: {
                name: 'index.js',
                type: 'umd',
            },
        },
        resolve: {
            extensions: ['.ts', '.js', '.css'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: 'ts-loader',
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
            ],
        },
        plugins: [],
    }
};