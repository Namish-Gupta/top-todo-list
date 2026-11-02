const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Empties the dist folder before each build
  },
  devtool: 'inline-source-map', // Pinpoints errors to the exact original file
  devServer: {
    static: './dist',
    watchFiles: ['src/**/*'], // Tells the server to reload when HTML or other files change
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/template.html',
      title: 'Todo List',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
};