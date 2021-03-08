/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

module.exports = merge(common, {
  mode: "development",
  devtool: "source-map",
  devServer: {
    contentBase: [path.join(__dirname, "dist"), path.join(__dirname, "assets")],
  },
});
