/* global module, __dirname, require */

const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  // devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts']
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib')
  },
  optimization: {
    minimize: false
  }
};
