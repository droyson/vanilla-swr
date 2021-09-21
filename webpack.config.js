const path = require('path')
// const DeclarationBundlerPlugin = require('types-webpack-bundler')

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'SWR',
      type: 'umd2',
      export: 'default',
      umdNamedDefine: true
    }
  }
}
