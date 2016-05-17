'use strict';

var gulp   = require('gulp'),
  header = require('gulp-header'),
  footer = require('gulp-footer'),
  concat = require('gulp-concat'),
  gzip   = require('gulp-gzip'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  mocha  = require('gulp-mocha'),
  Server = require('karma').Server;

gulp.task('scripts', function() {
  return gulp.src('src/**/*.js')
      .pipe(concat('maptalks.mapresty.js'))
      .pipe(header('(function () {\n\'use strict\';\n'))
      .pipe(footer('\n})();'))
      .pipe(gulp.dest('./dist'))
      .pipe(rename({suffix: '.min'}))
      .pipe(uglify())
      .pipe(gulp.dest('./dist'))
      .pipe(gzip())
      .pipe(gulp.dest('./dist'));
});


gulp.task('build',['scripts'],function() {
});

gulp.task('watch', ['test'], function () {
  var scriptWatcher = gulp.watch(['src/**/*.js', 'test/**/*.js','./gulpfile.js'], ['test']); // watch the same files in our scripts task
});

gulp.task('test', ['build'], function(done) {
  gulp.src(['dist/maptalks.mapresty.js','test/*.js'], {read: false})
        .pipe(mocha());
  var karmaConfig = {
    configFile: __dirname + '/karma.conf.js',
    browsers: ['PhantomJS'],
    singleRun: true
  };
  new Server(karmaConfig, done).start();
});

gulp.task('default', ['watch']);
