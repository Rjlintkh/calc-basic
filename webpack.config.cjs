const path = require("path");
const webpack = require("webpack");
const NpmDtsPlugin = require("npm-dts-webpack-plugin");

module.exports = {
  entry: "./index.ts",
  mode: "development",
  devtool: false,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ]
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.mjs",
    library: {
      type: "module",
    },
  },
  experiments: {
    outputModule: true,
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    new NpmDtsPlugin({
      entry: "./index.ts",
      output: "./dist/index.d.ts",
    })
  ],
  watch: true,
  watchOptions: {
    ignored: /node_modules/,
  }
};