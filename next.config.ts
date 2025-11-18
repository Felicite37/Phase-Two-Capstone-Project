const path = require("path");

module.exports = {
  experimental: {
    turbopack: true,
  },
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
  turbopack: {
    root: ".",
  },
};
