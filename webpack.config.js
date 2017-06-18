const webpack = require("webpack");
const path = require("path");

const plugins = [
  // enable scope hoisting for faster js execution
  new webpack.optimize.ModuleConcatenationPlugin(),
  // reference (https://webpack.js.org/guides/code-splitting-libraries/)
  // split webpack runtime and 3rd party libraries from the output bundle
  new webpack.optimize.CommonsChunkPlugin({
    name: "vendor",
    minChunks: function (module) {
       // this assumes your vendor imports exist in the node_modules directory
       return module.context && module.context.indexOf('node_modules') !== -1;
    }
  }),
  new webpack.optimize.CommonsChunkPlugin({
    // CommonChunksPlugin will now extract all the common modules from vendor and main bundles
    // But since there are no more common modules between them we end up with just the runtime code included in the manifest file.
    name: "manifest"
  }),
  // reference (https://webpack.js.org/guides/shimming/#provideplugin)
  // if we are using `whatwg-fetch` instead of `jQuery` for AJAX,
  // we need to make it available as a global.
  new webpack.ProvidePlugin({
    "Promise": "es6-promise",
    "fetch":   "imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch"
  })
];

// Create a production build when
// webpack is executed with -p flag (or)
// process.env.NODE_ENV is set to "production".
const isProduction = process.argv.indexOf("-p") >= 0 || (process.env.NODE_ENV === "production");
if (isProduction) {
  process.env.NODE_ENV = "production";
}

if (isProduction) {
  // include additional plugins to reduce the bundle size for production build
  plugins.push(new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("production") }));
  plugins.push(new webpack.optimize.AggressiveMergingPlugin());
  plugins.push(new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      comments: false,
      mangle: false,
      sourceMap: true // MUST set sourceMap https://webpack.js.org/guides/migrating/#uglifyjsplugin-sourcemap
  }));
}

module.exports = {
  // reference (https://webpack.js.org/guides/development/#source-maps)
  devtool: "source-map",

  // reference (https://webpack.js.org/configuration/resolve/#resolve)
  resolve: {
    // reference (https://webpack.js.org/configuration/resolve/#resolve-extensions)
    // must override to include JSX and TypeScript files
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
  },


  // reference #1 (https://webpack.js.org/concepts/entry-points/)
  // reference #2 (https://webpack.js.org/configuration/entry-context/#entry)
  entry: {
    app: "./src/js/index.tsx",
    // add additional entry points here as needed
    // reference (https://webpack.js.org/concepts/entry-points/)
  },

  // reference (https://webpack.js.org/concepts/output/)
  output: {
    path: path.resolve(__dirname, "dist/js"),
    filename: "[name].js" /* example output filename: app.bundle.js */
  },

  // `externals` tells webpack not to include the modules listed here in the JavaScript output bundle.
  // This is useful if you are including these from a CDN in your HTML page to reduce your JavaScript bundle output size.
  // reference (https://webpack.js.org/configuration/externals/#externals)
  // externals: {
  //   "react": "React",
  //   "react-dom": "ReactDOM"
  // },

  module: {
    // reference (https://webpack.js.org/concepts/loaders/)
    rules: [
      // include this segment if you are using TypeScript
      {
        test: /\.tsx?/,
        use: [
          { loader: "babel-loader" },
          { loader: "awesome-typescript-loader" }
        ]
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: "pre",
        test: /\.js/,
        loader: "source-map-loader"
      }
    ]
  },

  plugins: plugins
};