var path = require('path');
var webpack = require('webpack');
var webpackUMDExternal = require('webpack-umd-external');

module.exports = {
  devtool: 'sourcemap',
  entry: {
    index: './src/MotionGrid/index.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: 'dist/',
    filename: 'react-motion-grid.js',
    sourceMapFilename: 'react-motion-grid.map',
    library: 'ReactMotionGrid',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      output: { comments: false }
    })
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  externals: webpackUMDExternal({
    'react': 'React',
    'react-waypoint': 'ReactWaypoint',
    'react-motion': 'ReactMotion',
    'react-measure': 'ReactMeasure',
    'styled-components': 'ReactStyled',
  }),
};
