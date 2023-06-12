const path = require('path');

module.exports = {
    // Your existing webpack configuration...
    resolve: {
      fallback: {
        path: require.resolve('path-browserify')
      }
    }
  };
  