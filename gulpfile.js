
const gulp = require('gulp');

const fs = require('fs');
const path = require('path');
const del = require('del');
const rollup = require('rollup');
const rollupBabel   = require('rollup-plugin-babel');

// tasks
gulp.task('clean-dist', cleanDist);
gulp.task('build-js', buildJs);
gulp.task('watch', watchJs);
gulp.task('build-all', gulp.series('clean-dist', 'build-js'));
gulp.task('default', gulp.series('build-all', 'watch'));

// functions
async function cleanDist() {
  await del.sync('dist/**/*');
}

async function rollupBuild(folderName) {
  const inputFolder = `./src/${folderName}`;
  const inputOptions = {
    input: `${inputFolder}/index.js`,
    plugins: [
      rollupBabel({
        exclude: 'node_modules/**',
      })
    ]
  };
  const outputOptions = {
    file: `./dist/${folderName}.user.js`,
    format: 'iife',
    banner: () => fs.readFileSync(`${inputFolder}/header-comment.js`),
  };

  // create a bundle
  const bundle = await rollup.rollup(inputOptions);

  await bundle.write(outputOptions);
}

async function buildJs() {
  const srcDir = 'src';

  const srcFolders = fs.readdirSync(srcDir)
    .filter(file => fs.statSync(path.join(srcDir, file)).isDirectory());

  for (const folder of srcFolders) {
    await rollupBuild(folder);
  }
}

function watchJs() {
  gulp.watch('src/**/*.js', buildJs)
    .on('change', file => console.log('File changed:', file));
}
