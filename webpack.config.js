var path = require("path");

module.exports = {
  mode: 'development',
  context: path.resolve(__dirname, "src"),
  module: {
    rules: [
      {
        test: /\.html$/,
        use: "file-loader?name=[name].[ext]",
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(jpg|png|gif|hdr)$/,
        use: "file-loader",
      },
    ],
  },
  entry: {
    app: [
      "./app.js",
      "./index.html"
    ],
  },
  output: {
    filename: "./js/app.js",
    path: __dirname + "/public"
  },
  devtool: 'inline-source-map',
  devServer: {
    publicPath: '/',
    historyApiFallback: true, // so reloads will try to access index.html on failure, to allow react to respond
    contentBase: path.join(__dirname, "public"),
  },
};
