// for use with webpack v4
const path = require("path")

const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
    mode: 'production',
    entry: [
        "./src/index.js",
        "./src/index.css"
    ],
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                include: path.resolve(__dirname, "src"),
                use: 'vue-loader'
            },
            {
                test: /\.js$/,
                include: path.resolve(__dirname, "src"),
                loader: "babel-loader"
            },
            {
                test: /\.css$/,
                use:[
                    MiniCssExtractPlugin.loader,
                        // options: {
                        //     publicPath: path.resolve(__dirname, "dist")
                        // }
                    "css-loader"
                ]
            }

        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename:"bundle.css"
        })
    ],
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
        }
    },
    // devtool:"source-map"
}
