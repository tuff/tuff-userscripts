
const gulp = require('gulp');

const fs = require('fs');
const path = require('path');
const del = require('del');

const rollup = require('rollup-stream');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

const rollupBabel   = require('rollup-plugin-babel');

const header        = require('gulp-header');
const rename        = require('gulp-rename');
const sass          = require('gulp-sass');
const sourcemaps    = require('gulp-sourcemaps');
const iife          = require('gulp-iife');


// tasks
gulp.task('clean-dist', cleanDist);
gulp.task('build-sass', buildSass);
gulp.task('build-js', buildJs);
gulp.task('watch', watch);
gulp.task('default',['build-all', 'watch']);

gulp.task('build-all', [
  'clean-dist',
  'build-js',
  'build-sass',
]);

// functions
function getSrcFolders() {
  const srcDir = 'src';

  return fs.readdirSync(srcDir)
    .filter(function(file) {
      return fs.statSync(path.join(srcDir, file)).isDirectory();
    });
}

function cleanDist() {
  return del.sync('dist/**/*');
}

function buildSass() {
  return gulp.src('sass/app-index.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .on('error', onError)
    .pipe(rename('app.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/'));
}

function buildJsFolder(name) {
  return function() {
    const path = 'src/' + name;
    const targetName = name + '.user.js';

    return rollup({
        entry: path + '/index.js',
        sourceMap: true,
        plugins: [
          rollupBabel({
            exclude: 'node_modules/**',
          })
        ]
      })
      .pipe(source('index.js', path))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .on('error', onError)
      .pipe(iife({useStrict: false}))
      .pipe(rename(targetName))
      .pipe(sourcemaps.write('.'))
      .pipe(header(
        fs.readFileSync(path + '/header-comment.js', 'utf8')
      ))
      .pipe(gulp.dest('dist'));
  }
}

function buildJs() {
  return getSrcFolders()
    .map(buildJsFolder)
    .forEach(buildFolderFn => buildFolderFn());
}

function watch() {
  watchSass();
  watchJs();
}

function watchSass() {
  gulp.watch('**/*.scss', ['build-sass'])
    .on('change', onFileChange);
}

function watchJs() {
  gulp.watch('src/**/*.js', ['build-js'])
    .on('change', onFileChange);
}

function onError(err) {
  console.log(err);
  this.emit('end');
}

function onFileChange(file) {
  console.log(`File changed: ${file.path}`);
}
