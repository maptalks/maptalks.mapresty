const gulp = require('gulp');
const BundleHelper = require('maptalks-build-helpers').BundleHelper;
const TestHelper = require('maptalks-build-helpers').TestHelper;
const http = require('http');
const requestHandler = require('./test/mapresty/mock');
const pkg = require('./package.json');

const bundleHelper = new BundleHelper(pkg);
const testHelper = new TestHelper();
const karmaConfig = require('./karma.config');

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

gulp.task('mock', ['build'], () => {
    const mockServer = http.createServer(requestHandler);
    mockServer.listen(8090);
});

gulp.task('test', ['mock'], () => {
    testHelper.test(karmaConfig);
});

gulp.task('tdd', ['mock'], () => {
    karmaConfig.singleRun = false;
    gulp.watch(['index.js', 'src/**/*'], ['test']);
    testHelper.test(karmaConfig);
});

gulp.task('default', ['watch']);
