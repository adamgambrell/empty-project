var fs = require('fs');
var config = JSON.parse(fs.readFileSync('./gulp.config.json'));

var gulp = require('gulp');
var browserSync = require('browser-sync').create();

var rename = require('gulp-rename');
var notify = require("gulp-notify");
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');

var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
var concatCss = require('gulp-concat-css');


function onError(err) {
    notify.onError({
        title: 'An Error Has Occurred',
        message: 'Error: <%= error.message %>',
        sound: 'Submarine'
    })(err);
    this.emit('end');
}

function returnCssAssets() {
    var cssSrc = [];
    for (var m in config.assets.css) {
        cssSrc.push(config.assets.css[m]);
    }
    return cssSrc;
}

function returnJSAssets() {
    var jsSrc = [];
    for (var m in config.assets.js) {
        jsSrc.push(config.assets.js[m]);
    }
    return jsSrc;
}

//start the local dev server and watch for changes in wwwroot
gulp.task('init:Server', ['copy:Libraries'], function() {
    browserSync.init({
        server: {
            baseDir: config.dist.projectDist,
            index: config.dist.startPage
        }
    });
    gulp.watch([config.src.styles + '**/*.scss'], ['scss:Site']).on('change', browserSync.reload);
    gulp.watch([config.src.html + '**/*.html'], ['copy:Html']).on('change', browserSync.reload);
    gulp.watch([config.src.projectSrc + '**/*.*']).on('change', browserSync.reload);
});

//Copy libraries to dist folders
gulp.task('copy:Libraries', ['copy:Css', 'copy:JS', 'copy:Html'], function () {
    // gulp.src(['./src/styles/ensemble.css'])
    //     .pipe(gulp.dest('./dist/css/'));
    // gulp.src(['./src/styles/Wells_StylePack.css'])
    //     .pipe(gulp.dest('./dist/css/'));
});

gulp.task('copy:Css', function() {
   gulp.src(returnCssAssets())
       .pipe(gulp.dest(config.dist.css));
});

gulp.task('copy:JS', function() {
    gulp.src(returnJSAssets())
        .pipe(gulp.dest(config.dist.js));
});

gulp.task('copy:Html', function() {
    return gulp.src(config.src.projectSrc + '**/*.html')
        .pipe(gulp.dest(config.dist.projectDist))
});

gulp.task('scss:Site', function() {
    return gulp.src(config.src.styles + 'scss/site.scss')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest(config.dist.css))
        .pipe(cssnano())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(config.dist.css))
        .pipe(notify({
        'remove': 'ALL',
        'title': 'GULP',
        'message': 'CSS Created',
        'sound': 'Morse'
    }));
});


