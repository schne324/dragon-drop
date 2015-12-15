/* global require */
'use strict';

var gulp = require('gulp');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');

gulp.task('default', ['templates', 'styles']);

gulp.task('templates', function () {
  gulp.src('example/example.jade')
    .pipe(jade())
    .pipe(gulp.dest('example'));
});

gulp.task('styles', function () {
  gulp.src('example/styles.styl')
    .pipe(stylus())
    .pipe(gulp.dest('example'));
});

gulp.task('watch', function () {
  gulp.watch('example/example.jade', ['templates']);
  gulp.watch('example/styles.styl', ['styles']);
});