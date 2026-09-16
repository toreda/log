/**
 *	MIT License
 *
 *	Copyright (c) 2019 - 2022 Toreda, Inc.
 *
 *	Permission is hereby granted, free of charge, to any person obtaining a copy
 *	of this software and associated documentation files (the "Software"), to deal
 *	in the Software without restriction, including without limitation the rights
 *	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *	copies of the Software, and to permit persons to whom the Software is
 *	furnished to do so, subject to the following conditions:

 * 	The above copyright notice and this permission notice shall be included in all
 * 	copies or substantial portions of the Software.
 *
 * 	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * 	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * 	SOFTWARE.
 *
 */

import gulp, {dest, series, src} from 'gulp';

import {ESLint} from 'eslint';
import del from 'del';
import ts from 'gulp-typescript';

const eslint = new ESLint({
	useEslintrc: true
});

const srcPatterns = ['src/**.ts', 'src/**/*.ts'];
const tsc = ts.createProject('tsconfig.json');

async function linter() {
	const result = await eslint.lintFiles(srcPatterns);
	const formatter = await eslint.loadFormatter('stylish');

	const output = formatter.format(result);
	console.log(output);
}

function createDist() {
	// Hack to create folder structures without actually reading files.
	// Nested folders need to be created in their nested order.
	// NOTE: In other projects this task is handled by `@toreda/build-tools`, however
	// we cannot use it here because this package is a dependency of build-tools.
	return src('*.*', {read: false}).pipe(gulp.dest('./dist'));
}

async function cleanDist() {
	// NOTE: In other projects this task is handled by `@toreda/build-tools`, however
	// we cannot use it here because this package is a dependency of build-tools.
	return del(`dist/**`, {
		force: true,
		dryRun: false
	});
}

function buildSrc() {
	// Build typescript sources and output them in './dist'.
	// NOTE: In other projects this task is handled by `@toreda/build-tools`, however
	// we cannot use it here because this package is a dependency of build-tools.
	return src(srcPatterns).pipe(tsc()).pipe(dest('dist'));
}

exports.default = series(createDist, cleanDist, linter, buildSrc);
