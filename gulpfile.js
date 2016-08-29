/*
 * Copyright (c) 2016 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    nodemon = require('gulp-nodemon');


gulp.task('lint', function () {
    return gulp.src(['**/*.js', '!node_modules/**/*.js', '!license_checker/**/*.js', '!test/**/*.js'])
        .pipe(jshint('./.jshintrc'))
        .pipe(jshint.reporter('default'));
});

gulp.task('test', function () {
    gulp.src('test/**/*.spec.js')
        .pipe(mocha({
            reporter: 'nyan',
            clearRequireCache: true,
            ignoreLeaks: true
        }));
});

gulp.task('develop', function () {
    nodemon({
        script: 'app.js',
        ext: 'html js',
        env: {'NODE_ENV': 'development'}
    });
});

gulp.task('watch', function () {
    gulp.watch('**/*.js', ['lint', 'test']);
});

// Default Task
gulp.task('default', ['lint', 'test']);