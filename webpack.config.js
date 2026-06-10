const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  mode: 'development',
  devtool: 'cheap-source-map',
  entry: {
    content: './src/content/index.js',
    background: './src/background/index.js',
    popup: './src/popup/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public', to: '.' },
      ],
    }),
    new webpack.DefinePlugin({
      'process.env.GROQ_API_KEY': JSON.stringify(process.env.GROQ_API_KEY),
    }),
  ],
  entry: {
    content: './src/content/index.js',
    content_bridge: './src/content/bridge.js',
    background: './src/background/index.js',
    popup: './src/popup/index.js',
  },
};