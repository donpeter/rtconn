const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const plumber = require('gulp-plumber');
const livereload = require('gulp-livereload');
const eslint = require('gulp-eslint');
const sass = require('gulp-sass');

gulp.task('sass', () => {
  gulp.src('./public/css/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('./public/css'))
    .pipe(livereload());
});

gulp.task('watch', () => {
  gulp.watch('./public/css/*.scss', ['sass']);
});

gulp.task('develop', () => {
  livereload.listen();
  nodemon({
    script: 'bin/www',
    ext: 'js handlebars coffee',
    stdout: false,
  }).on('readable', function() {
    this.stdout.on('data', (chunk) => {
      if (/^Express server listening on port/.test(chunk)) {
        livereload.changed(__dirname);
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});

gulp.task('lint', function() {
  return gulp.src('client/app/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('default', [
  'sass',
  'lint',
  'develop',
  'watch',
]);
