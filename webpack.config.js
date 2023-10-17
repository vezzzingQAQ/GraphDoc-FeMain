const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ConditionCompilePlugin = require("condition-compile-plugin");
const webpack = require("webpack");

const APP_MODE = "development";

module.exports = {
    mode: APP_MODE,
    entry: {
        graphEditor: "./src/graphEditor/index.js",
        userMain: "./src/userMain/index.js",
        visualization: "./src/visualization/index.js",
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
            filename: "visualization.html",
            minify: {
                collapseWhitespace: true
            },
            template: "./src/visualization/html/index.html",
            chunks: ["visualization"]
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
                    from: path.resolve(__dirname, "src/asset/img/nodeTp"),
                    to: path.resolve(__dirname, "dist/nodeTp")
                },
                {
                    from: path.resolve(__dirname, "src/asset/js/templateDya"),
                    to: path.resolve(__dirname, "dist/graphTemplate")
                }
            ]
        }),
        // 条件编译
        // RUN_ENV
        // · web-打包浏览器端
        // · app-打包app端
        // TYPE
        // · production-生产环境
        // · development-开发环境
        new webpack.DefinePlugin({
            "process.env": {
                "RUN_ENV": JSON.stringify("app"),
                "APP_MODE": JSON.stringify(APP_MODE)
            }
        }),
        new ConditionCompilePlugin(),
    ]
};