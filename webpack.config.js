const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    mode: "development",
    entry: {
        graphEditor: "./src/graphEditor/index.js",
        userMain: "./src/userMain/index.js",
        publicMain: "./src/publicMain/index.js"
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.(?:js|mjs|cjs)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: "defaults" }]
                        ]
                    }
                }
            },
            {
                test: /\.less$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "postcss-loader",
                    "less-loader"
                ]
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader",
                ]
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|wav|mp3|woff2)$/,
                use: 'file-loader'
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: "graphEditor.html",
            minify: {
                collapseWhitespace: true
            },
            template: "./src/graphEditor/html/index.html",
            chunks: ["graphEditor"]
        }),
        new HtmlWebpackPlugin({
            filename: "userMain.html",
            minify: {
                collapseWhitespace: true
            },
            template: "./src/userMain/html/index.html",
            chunks: ["userMain"]
        }),
        new HtmlWebpackPlugin({
            filename: "publicMain.html",
            minify: {
                collapseWhitespace: true
            },
            template: "./src/publicMain/html/index.html",
            chunks: ["publicMain"]
        }),
        // 复制静态文件
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "src/asset/graph/graphTemplate"),
                    to: path.resolve(__dirname, "dist/graphTemplate")
                },
                {
                    from: path.resolve(__dirname, "src/asset/img/graphTemplate"),
                    to: path.resolve(__dirname, "dist/graphTemplate")
                },
                {
                    from: path.resolve(__dirname, "src/asset/js/templateDya"),
                    to: path.resolve(__dirname, "dist/graphTemplate")
                }
            ]
        })
    ]
};