// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { DefinePlugin } = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

// Загружаем переменные окружения из .env
require('dotenv').config({
	path: path.resolve(__dirname, '.env'),
});

const isProduction = process.env.NODE_ENV === 'production';

const stylesHandler = MiniCssExtractPlugin.loader;

const config = {
	entry: './src/index.ts',
	devtool: 'source-map',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js', // Убедитесь, что файл создаётся
		clean: true, // Очистка папки перед сборкой
	},
	devServer: {
		open: true,
		host: 'localhost',
		watchFiles: ['src/pages/*.html'],
		hot: true,
		proxy: {
			'/api': {
				target: 'https://larek-api.nomoreparties.co',
				changeOrigin: true,
				secure: true, // Установите в `false`, если API использует самоподписанный SSL-сертификат
			},
			'/content': {
				target: 'https://larek-api.nomoreparties.co',
				changeOrigin: true,
				secure: true,
			},
		},
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'src/pages/index.html',
		}),

		new MiniCssExtractPlugin(),

		new DefinePlugin({
			'process.env.DEVELOPMENT': JSON.stringify(!isProduction),
			'process.env.API_ORIGIN': JSON.stringify(process.env.API_ORIGIN || ''),
		}),
	],
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/i,
				use: ['babel-loader', 'ts-loader'],
				exclude: /node_modules/,
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					stylesHandler,
					'css-loader',
					'postcss-loader',
					'resolve-url-loader',
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
							sassOptions: {
								includePaths: ['src/scss'],
							},
						},
					},
				],
			},
			{
				test: /\.css$/i,
				use: [stylesHandler, 'css-loader', 'postcss-loader'],
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
				type: 'asset',
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
	},
	optimization: {
		minimize: isProduction,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					keep_classnames: true,
					keep_fnames: true,
				},
			}),
		],
	},
};

module.exports = () => {
	config.mode = isProduction ? 'production' : 'development';
	return config;
};
