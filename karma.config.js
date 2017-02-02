const pkg = require('./package.json');

module.exports = {
    basePath : '.',
    frameworks: ['mocha', 'expect', 'expect-maptalks', 'happen'],
    files: [
        'node_modules/maptalks/dist/maptalks.js',
        'dist/' + pkg.name + '.js',
        //'test/**/*.js'
        'test/DynamicLayerSpec.js',
        { pattern: 'test/resources/*', watched: false, included: false, served: true }
    ],
    proxies: {
        '/resources/': '/base/test/resources/'
    },
    preprocessors: {
    },
    browsers: ['Chrome'],
    reporters: ['mocha'],
    customLaunchers: {
        IE10: {
            base: 'IE',
            'x-ua-compatible': 'IE=EmulateIE10'
        },
        IE9: {
            base: 'IE',
            'x-ua-compatible': 'IE=EmulateIE9'
        }
    },
    singleRun : true
};
