const { src, dest, watch, series, parallel } = require('gulp');
const browserSync = require('browser-sync').create();

//плагины
const sass = require('gulp-dart-sass');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const concat = require('gulp-concat');
const mediaQueries = require('gulp-group-css-media-queries');
const autoprefixer = require('gulp-autoprefixer');
const pug = require("gulp-pug"); 
const pugbem = require("gulp-pugbem");
const del = require('del');

//обработка html
const pugBem = () => {
    return src('./src/*.pug')
    .pipe(
        pug({
            plugins: [pugbem],
            pretty: true,
        })
    )
        .pipe(dest('./dist'))
        .pipe(browserSync.stream());
}

//обработка стилей
const styles = () => {
    return src('./src/scss/main.{scss, saas}', {
            sourcemaps: true
        })
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', notify.onError()))
        .pipe(concat('main.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions']
        }))
        .pipe(mediaQueries())
        .pipe(dest('./dist', {
            sourcemaps: true
        }))
        .pipe(browserSync.stream());
}


//скрипты
const scripts = () => {
    return src('./src/js/main.js', {
            sourcemaps: true
        })
        .pipe(concat('main.min.js'))
        .pipe(dest('./dist', {
            sourcemaps: true
        }))
        .pipe(browserSync.stream());
}

//переносим картинки в dist
const images = () => {
    return src('./src/img/**.*')
        .pipe(dest('./dist/img'))
}

//перезапись папки dist при релоаде
const clear = () => {
    return del('./dist')
}

//live сервер
const server = () => {
    browserSync.init({
        server: {
            baseDir: 'dist'
        }
    })
}

//наблюдение за изменениями в файлах
const watcher = () => {
    watch('./src/**/*.pug', pugBem)
    watch(['./src/**/*.scss', './#src/**/*.sass', './#src/**/*.css'], styles)
    watch('./src/js/*.js', scripts)
    watch('./src/img/**.*', images)
}

//задачи
exports.pugBem = pugBem;
exports.watch = watch;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;

//сборка | очередь запуска задач
exports.default = series(
    clear,
    pugBem,
    styles,
    scripts,
    images,
    parallel(watcher, server)
);