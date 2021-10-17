/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const keysTransformer = require('ts-transformer-keys/transformer').default;

module.exports = function(env) {
    const isEnvDevelopment = env["INSTANCE"] === "development";
    const isEnvProduction = env["INSTANCE"] === "production";
    return {
        mode: "development",
        // These are the "entry points" to our application.
        // This means they will be the "root" imports that are included in JS bundle.
        entry: [path.join(__dirname, 'src', 'app.ts')],
        output: {
            path: path.join(__dirname, './build'),
            filename: 'bundle.js',
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    include: path.join(__dirname, 'src'),
                    loader: 'ts-loader',
                    options: {
                        getCustomTransformers: program => ({
                            before: [keysTransformer(program)],
                        }),
                    },
                },
                {
                    test: /\.css$/,
                    exclude: /\.module\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.module\.css$/,
                    use: [
                        { loader: 'style-loader' },
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.(scss|sass)$/,
                    exclude: /\.module\.(scss|sass)$/,
                    use: ['style-loader', 'css-loader', 'sass-loader'],
                },
                {
                    test: /\.module\.(scss|sass)$/,
                    use: [
                        { loader: 'style-loader' },
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                            },
                        },
                        { loader: 'sass-loader' },
                    ],
                },
                {
                    test: /\.(svg|png|jpg|jpeg)$/,
                    loader: 'file-loader',
                },
            ],
        },
        plugins: [
            isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
            isEnvProduction &&
                new MiniCssExtractPlugin({
                    // Options similar to the same options in webpackOptions.output
                    // both options are optional
                    filename: 'static/css/[name].[contenthash:8].css',
                    chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
                }),
            new CopyWebpackPlugin({patterns: ['public/**', 'assets/**']}),
            // TypeScript type checking
            new ForkTsCheckerWebpackPlugin({
                async: isEnvDevelopment
            }),
        ].filter(Boolean)
    };
};
