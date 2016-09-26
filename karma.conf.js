// -*- js2-basic-offset: 2; js-indent-level: 2 -*-
/* jshint node: true */

module.exports = function(config) {
  'use strict';


  var files = [
    './node_modules/maptalks/dist/maptalks.js',
    'src/**/*.js',
    'test/DynamicLayerSpec.js',
    {pattern: 'test/resources/*', watched: false, included: false, served: true}
  ];

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '',

    proxies: {
      '/resources/': '/base/test/resources/'
    },

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      'mocha',
      'expect'
    ],

    // list of files / patterns to load in the browser
    files: files,

    // list of files / patterns to exclude
    exclude: [
    ],

    preprocessors: {
      // 'test/**/*.js': [ 'browserify' ] //Mention path as per your test js folder
    },
    // add additional browserify configuration properties here
    // such as transform and/or debug=true to generate source maps
    // browserify: {
    //   debug: true
    // },
    // coverageReporter: {
    //   type: 'html',
    //   dir: 'coverage',
    // },


    // web server port
    port: 12345,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS',
      'Chrome'
    ],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-expect'
    ],

    customLaunchers: {

    },

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
