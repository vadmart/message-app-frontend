module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', ['@babel/preset-env', {targets: {node: 'current'}}], '@babel/preset-typescript'],
    "plugins": [
    ["module-resolver", {
      "alias": {
        "@app": "./src",
        "@img": "./assets"
      }
    }],
    "react-native-reanimated/plugin",
  ]
  };
};
