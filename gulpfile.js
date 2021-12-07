const {
    src,
    dest,
    watch,
    series
} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const terser = require('gulp-terser');
//const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();


const paths = {
    scss: {
        src: './scss/**/*.scss',
        dest: './dist/css',
    },
    js: {
        src: './js/**/*.js',
        dest: './dist/js',
    },
    html: {
        src: './*.html',
        dest: './dist',
    },
    img: {
        src: './images/**/*.*',
        dest: './dist/images',
    },
}

// kompilacja stylów css
function styleTask() { 
    return src(paths.scss.src, { sourcemaps: true }) // skąd pobrać dane scss do kompilacji
        .pipe(concat('style.css')) // łączy _partials w jeden plik wynikowy
        .pipe(sass()) // kompilacja plików scss na css
        .on('error', sass.logError) // wylogowanie ewentualnych błędów w plikach scss
        .pipe(postcss([autoprefixer(), cssnano()])) // dodanie autoprefixerów i kompresja plików wynikowych]
        .pipe(dest(paths.scss.dest), { sourcemaps: '.' }) // gdzie umieścić plik wynikowy
        .pipe(browserSync.stream()) // skierowanie na bieżąco danych do przeglądarki
}

// kompilacja plików js
function jsTask() {
    return src(paths.js.src, { sourcemaps: true }) // skąd pobrać dane
        .pipe(concat('all.js')) // łączy wszystkie pliki w jeden plik wynikowy
        .pipe(terser()) // dokonuje kompresji pliku all.js
        .pipe(dest(paths.js.dest, { sourcemaps: '.' }))
        .pipe(browserSync.stream())
}

// przeniesienie pliku html z katalogu roboczego do docelowego
function htmlTask() {
    return src(paths.html.src)
    .pipe(dest(paths.html.dest))
}

// kompresja obrazków
function imgTask() {
    return src(paths.img.src)
        //.pipe(imagemin())
        .pipe(dest(paths.img.dest))
}

// nasłuchiwanie na zmiany w plikach
function watchTask() {
    // inicjalizacja browser-sync
    browserSync.init({ // obiekt konfiguracyjny servera
        server: {
            baseDir: './dist' // skąd serwować pliki do przeglądarki (z dist)
        }
    });
    // nasłuchiwanie zmian w rodzajach plików i wykonywanie zadań kompilacyjnych
    watch(paths.html.src, htmlTask).on('change', browserSync.reload);
    watch(paths.img.src, imgTask);
    watch(paths.scss.src, {usePolling: true}, styleTask);
    watch(paths.js.src, jsTask);
}

// wyesportowanie wszystkich funkcji w serii
exports.default = series(
    styleTask,
    jsTask,
    imgTask,
    htmlTask,
    watchTask,
)



