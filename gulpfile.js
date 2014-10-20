var gulp = require('gulp'),
    sass = require('gulp-sass'),
    connect = require('gulp-connect'),
    htmlReplace = require('gulp-html-replace'),
    concat = require('gulp-concat');

var paths = {
    app: 'app/',
    build: 'build/',
    scss: 'app/scss/**/*.scss',
    html: 'app/index.html',
    js: 'app/js/**/*.js',
    data: 'app/data/**/*'
};

gulp.task('scss', function () {
    return gulp.src(paths.scss)
        .pipe(sass())
        .pipe(gulp.dest(paths.build + 'css'));
});

gulp.task('html', function () {
    return gulp.src(paths.html)
        .pipe(htmlReplace({
            js: './js/build.js'
        }))
        .pipe(gulp.dest(paths.build))
        .pipe(connect.reload());
});

gulp.task('js', function () {
    return gulp.src(paths.js)
        .pipe(concat('build.js'))
        .pipe(gulp.dest(paths.build + 'js'))
        .pipe(connect.reload());
});

gulp.task('data', function () {
    return gulp.src(paths.data)
        .pipe(gulp.dest(paths.build + 'data'))
});

gulp.task('serve', ['build'], function() {
    connect.server({
        root: paths.build,
        livereload: true
    });
});

gulp.task('watch', ['serve'], function() {
    gulp.watch([paths.html], ['html']);
    gulp.watch([paths.scss], ['scss']);
    gulp.watch([paths.js], ['js']);
});

gulp.task('build', ['scss', 'html', 'js', 'data']);

gulp.task('default', ['build']);

gulp.task('dev', ['watch']);