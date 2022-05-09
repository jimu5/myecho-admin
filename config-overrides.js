const { override } = require('customize-cra');  //override是覆写react隐藏的webpack配置
const path = require('path');
module.exports = override(
  (config) => {
    config.resolve.alias = {
      '@': path.resolve(__dirname, './src'),
    };
    return config;
  }
);
