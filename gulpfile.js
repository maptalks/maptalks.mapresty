const gulp = require('gulp'),
    path = require('path'),
    pkg = require('./package.json'),
    BundleHelper = require('maptalks-build-helpers').BundleHelper,
    TestHelper = require('maptalks-build-helpers').TestHelper;
const bundleHelper = new BundleHelper(pkg);
const testHelper = new TestHelper();
const karmaConfig = require('./karma.config');
const Server = require('karma').Server;

gulp.task('build', () => {
    const rollupConfig = bundleHelper.getDefaultRollupConfig();
    rollupConfig['sourceMap'] = false;
    return bundleHelper.bundle('index.js', rollupConfig);
});

gulp.task('minify', ['build'], () => {
    bundleHelper.minify();
});

gulp.task('watch', ['build'], () => {
    gulp.watch(['index.js', 'src/**/*', './gulpfile.js'], ['build']);
});

gulp.task('test', ['build'], () => {
    testHelper.test(karmaConfig);
});

gulp.task('tdd', ['build'], () => {
    karmaConfig.singleRun = false;
    gulp.watch(['index.js', 'src/**/*'], ['test']);
    testHelper.test(karmaConfig);
});

gulp.task('debug', function (done) {
    var karmaConfig = {
        configFile: path.join(__dirname, 'karma.config.js'),
        browsers: ['Chrome'],
        singleRun: false
    };
    var server = new Server(karmaConfig, done);
    server.start();
});

gulp.task('default', ['watch']);

