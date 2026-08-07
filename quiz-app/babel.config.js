const path = require("path");

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      path.resolve(__dirname, "node_modules/expo/node_modules/babel-preset-expo"),
    ],
    plugins: [
      path.resolve(__dirname, "node_modules/react-native-worklets/plugin"),
    ],
  };
};
