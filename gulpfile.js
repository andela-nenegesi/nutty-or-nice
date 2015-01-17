var browserify = require('browserify'),
    bower = require('gulp-bower'),
    concat = require('gulp-concat'),
    karma = require('gulp-karma'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    shell = require('gulp-shell'),
    jade = require('gulp-jade'),
    jshint = require('gulp-jshint'),
    less = require('gulp-less'),
    minifyHtml = require('gulp-minify-html'),
    nodemon = require('gulp-nodemon'),
    path = require('path'),
    protractor = require('gulp-protractor').protractor,
    source = require('vinyl-source-stream'),
    stringify = require('stringify'),
    watchify = require('watchify'),
    mocha = require('gulp-mocha'),
    exit = require('gulp-exit');

// Test Coverage
// $ CODECLIMATE_REPO_TOKEN=5bdb37d182c2eee89c140cf44f338a0a20f6bc0ebaa648d7cc660dece14af397 codeclimate < "coverage/Chrome 39.0.2171 (Mac OS X 10.9.5)/lcov.info"

var paths = {
  public: 'public/**',
  jade: 'app/**/*.jade',
  styles: 'app/styles/*.+(less|css)',
  scripts: 'app/**/*.js',
  staticFiles: [
    '!app/**/*.+(less|css|js|jade)',
     'app/**/*.*'
  ],
  unitTests: [
      'public/lib/angular/angular.js',
      'public/lib/angular-mocks/angular-mocks.js',
      'public/lib/angular-route/angular-route.js',
      'public/lib/angular-ui-router/release/angular-ui-router.js',
      'public/lib/angular-cookies/angular-cookies.js',
      'public/lib/angular-elastic/elastic.js',
      'public/lib/angular-bootstrap/ui-bootstrap.js',
      'public/lib/hammerjs/hammer.js',
      'public/lib/jquery/dist/jquery.min.js',
      'public/lib/angular-aria/angular-aria.js',
      'public/lib/angular-material/angular-material.js',
      'public/lib/angular-animate/angular-animate.js',
      'public/lib/angular-sanitize/angular-sanitize.js',
      'public/lib/angularfire/dist/angularfire.js',
      'public/lib/moment/moment.js',
      'public/lib/firebase/firebase.js',
      'public/js/index.js',
      'public/lib/lodash/dist/lodash.min.js',
      'public/lib/angular-sortable-view/src/angular-sortable-view.js',
      'app/test/**/*.js'],
};

gulp.task('jade', function() {
  gulp.src(paths.jade)
    .pipe(jade())
    .pipe(gulp.dest('./public/'));
});

gulp.task('less', function () {
  gulp.src(paths.styles)
    .pipe(less({
      paths: [ path.join(__dirname, 'styles') ]
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('static-files',function(){
  return gulp.src(paths.staticFiles)
    .pipe(gulp.dest('public/'));
});

gulp.task('lint', function () {
  gulp.src(['./app/**/*.js','./index.js','./lib/**/*.js', './config/**/*.js']).pipe(jshint())
  .pipe(jshint.reporter('default'));
});

gulp.task('nodemon', function () {
  nodemon({ script: 'index.js', ext: 'js', ignore: ['public/**','app/**','node_modules/**'] })
    .on('restart',['jade','less'], function () {
      console.log('>> node restart');
    });
});

gulp.task('scripts', function() {
  gulp.src(paths.scripts)
    .pipe(concat('index.js'))
    .pipe(gulp.dest('./public/js'));
});


gulp.task('watchify', function() {
  var bundler = watchify(browserify('./app/application.js', watchify.args));

  bundler.transform(stringify(['.html']));
  // bundler.transform(es6ify);

  bundler.on('update', rebundle);

  function rebundle() {
    return bundler.bundle()
      // log errors if they happen
      .on('success', gutil.log.bind(gutil, 'Browserify Rebundled'))
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('index.js'))
      .pipe(gulp.dest('./public/js'));
  }
  return rebundle();
});


gulp.task('browserify', function() {
  var b = browserify();
  b.add('./app/application.js');
  return b.bundle()
  .on('success', gutil.log.bind(gutil, 'Browserify Rebundled'))
  .on('error', gutil.log.bind(gutil, 'Browserify Error: in browserify gulp task'))
  .pipe(source('index.js'))
  .pipe(gulp.dest('./public/js'));
});

gulp.task('watch', function() {
  // livereload.listen({ port: 35729 });
  gulp.watch(paths.jade, ['jade']);
  gulp.watch(paths.styles, ['less']);
  gulp.watch(paths.scripts, ['browserify']);
  // gulp.watch(paths.public).on('change', livereload.changed);
});

gulp.task('bower', function() {
  return bower()
    .pipe(gulp.dest('public/lib/'));
});

gulp.task('test:ui', ['browserify'], function() {
  return gulp.src(paths.unitTests)
  .pipe(karma({
    configFile: 'karma.conf.js',
    action: 'run'
  }))
  .pipe(exit());
});

gulp.task('test:lib',function() {
  return gulp.src(paths.libTests)
  .pipe(mocha({
    reporter: 'spec',
    timeout: 50000
  }));
});

gulp.task('test:e2e',function(cb) {
  gulp.src(['./test/e2e/**/*.js'])
  .pipe(protractor({
    configFile: 'protractor.conf.js',
    args: ['--baseUrl', 'http://127.0.0.1:8000']
  }))
  .on('error', function(e) {
      console.log(e);
  })
  .on('end', cb);
});

gulp.task('test:one', ['browserify'], function() {

  var argv = process.argv.slice(3);
  console.log(argv);

  var testPaths = paths.unitTests;
  testPaths = testPaths.splice(0,testPaths.length-1);

  if(argv[0] === '--file' && argv[1] !== undefined) {
    testPaths.push('app/test/' + argv[1].trim());
  }

  return gulp.src(testPaths)
  .pipe(karma({
    configFile: 'karma.conf.js',
    action: 'run'
  }))
  .on('error', function(err) {
    // Make sure failed tests cause gulp to exit non-zero
    throw err;
  });
});

gulp.task('build', ['bower', 'jade','less','browserify','static-files']);
gulp.task('production', ['nodemon','build']);
gulp.task('default', ['nodemon', 'build', 'watch']);
gulp.task('heroku:production', ['build']);
gulp.task('test', ['test:ui','test:lib']);
