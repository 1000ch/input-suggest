var gulp = require('gulp');

gulp.task('js', function () {

  var browserify = require("browserify");
  var babelify   = require("babelify");
  var source     = require('vinyl-source-stream');
  var buffer     = require('vinyl-buffer');
  var rename     = require("gulp-rename");
  var uglify     = require("gulp-uglify");
  var fileName   = 'input-suggest';

  browserify({
    standalone: 'InputSuggest',
    entries: ['src/index.js'],
    extensions: ['.js']
  }).transform(babelify)
    .bundle()
    .pipe(source(fileName + '.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist/'))
    .pipe(rename(fileName + '.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/'));
});

gulp.task('build', function () {
  gulp.start('js');
});

gulp.task('test', function () {

  var eslint = require('gulp-eslint');

  return gulp.src(['src/js/*.js'])
    .pipe(eslint({
      useEslintrc: true
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('watch', function () {
  gulp.watch(['src/*.js'], function () {
    gulp.start('test', 'js');
  });
});
