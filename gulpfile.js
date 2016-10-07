var gulp = require('gulp'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    gutil = require('gulp-util'),
    babelify = require('babelify');

// External dependencies
var deps = [
    'react',
    'react-dom'
];

// 'scripts' task count
var scriptsCount = 0;

// Task: bundles app for DEV
gulp.task('scripts', function () {
    bundleApp(false);
});

// Task: bundles app for PROD
gulp.task('deploy', function (){
    bundleApp(true);
});

// Task: watch
gulp.task('watch', function () {
    gulp.watch(['./app/*.js'], ['scripts']);
});

// Task: default
gulp.task('default', ['scripts','watch']);


/**
 * Bundles the app, in DEV or PROD mode,
 * depending on the given parameter.
 *
 * @param mode
 */
function bundleApp(prod) {

    // Task count
    scriptsCount++;

    // Browserify config
    var appBundler = browserify({
        entries: './app/app.js',
        debug: !prod
    });

    // DEV mode: build vendors script only once
    if (!prod && scriptsCount === 1){
        browserify({
            require: deps,
            debug: true
        })
        .bundle()
        .on('error', gutil.log)
        .pipe(source('vendors.js'))
        .pipe(gulp.dest('./web/js/'));
    }

    // PROD mode: externalize deps
    if (prod){
        deps.forEach(function(dep){
            appBundler.external(dep);
        })
    }

    // Transform ES6 / JSX to ES5
    appBundler
        .transform("babelify", {presets: ["es2015", "react"]})
        .bundle()
        .on('error', gutil.log)
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./web/js/'));
}