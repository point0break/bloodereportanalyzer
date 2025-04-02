module.exports = function override(config) {
    // Ignore source map warnings
    config.ignoreWarnings = [
      {
        module: /html2pdf\.js/,
        message: /Failed to parse source map/,
      },
    ];
    return config;
  };
