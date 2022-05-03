"use strict";

import * as webpack from "webpack";
import * as path from "path";
import CopyPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
// TODO; we should add a declaration file
//@ts-ignore
import VueLoaderPlugin from "vue-loader/lib/plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import Helper from "./src/helper";

const isProduction = process.env.NODE_ENV === "production";
const config: webpack.Configuration = {
	mode: isProduction ? "production" : "development",
	entry: {
		"js/bundle.js": [path.resolve(__dirname, "client/js/vue.ts")],
	},
	devtool: "source-map",
	output: {
		path: path.resolve(__dirname, "public"),
		filename: "[name]",
		publicPath: "/",
	},
	performance: {
		hints: false,
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: "vue-loader",
			},
			// {
			// 	test: /\.ts$/,
			// 	use: {
			// 		loader: "ts-loader",
			// 		options: {
			// 			compilerOptions: {
			// 				preserveWhitespace: false,
			// 			},
			// 			appendTsSuffixTo: [/\.vue$/],
			// 		},
			// 	},
			// 	exclude: path.resolve(__dirname, "node_modules"),
			// },
			{
				test: /\.{js,ts}$/,
				include: [path.resolve(__dirname, "client/")],
				exclude: path.resolve(__dirname, "node_modules"),
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env", "babel-preset-typescript-vue"],
					},
				},
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							esModule: false,
						},
					},
					{
						loader: "css-loader",
						options: {
							url: false,
							importLoaders: 1,
							sourceMap: true,
						},
					},
					{
						loader: "postcss-loader",
						options: {
							sourceMap: true,
						},
					},
				],
			},
		],
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				commons: {
					test: /[\\/]node_modules[\\/]/,
					name: "js/bundle.vendor.js",
					chunks: "all",
				},
			},
		},
	},
	resolve: {
		// alias: {
		// 	vue$: "vue/dist/vue.esm.js",
		// },
		extensions: [".js", ".vue", ".json", ".ts"],
		// modules: ["node_modules", path.resolve(__dirname, "client")],
		plugins: [
			new TsconfigPathsPlugin({
				configFile: path.resolve(__dirname, "client/tsconfig.json"),
				extensions: [".js", ".vue", ".json", ".ts"],
				baseUrl: path.resolve(__dirname, "client"),
			}),
		],
	},
	externals: {
		json3: "JSON", // socket.io uses json3.js, but we do not target any browsers that need it
	},
	plugins: [
		new VueLoaderPlugin({
			esModule: true,
		}),
		new MiniCssExtractPlugin({
			filename: "css/style.css",
		}),
		new CopyPlugin({
			patterns: [
				{
					from: "./node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff*",
					to: "fonts/[name][ext]",
				},
				{
					from: "./client/js/loading-error-handlers.js",
					to: "js/[name][ext]",
				},
				{
					from: "./client/*",
					to: "[name][ext]",
					globOptions: {
						ignore: ["**/index.html.tpl", "**/service-worker.js"],
					},
				},
				{
					from: "./client/service-worker.js",
					to: "[name][ext]",
					transform(content) {
						return content
							.toString()
							.replace(
								"__HASH__",
								isProduction ? Helper.getVersionCacheBust() : "dev"
							);
					},
				},
				{
					from: "./client/audio/*",
					to: "audio/[name][ext]",
				},
				{
					from: "./client/img/*",
					to: "img/[name][ext]",
				},
				{
					from: "./client/themes/*",
					to: "themes/[name][ext]",
				},
			],
		}),
		// socket.io uses debug, we don't need it
		new webpack.NormalModuleReplacementPlugin(
			/debug/,
			path.resolve(__dirname, "scripts/noop.js")
		),
	],
};

export default config;