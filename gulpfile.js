const gulp = require('gulp')
const esbuild = require('gulp-esbuild')
const ts = require('gulp-typescript')
const { TsconfigPathsPlugin } = require('@esbuild-plugins/tsconfig-paths')
const { NodeResolvePlugin } = require('@esbuild-plugins/node-resolve')

const source_source = 'src/index.ts'
const tests_source = ['tests/**/*.ts']

const source_dest = {
	dir: 'build/',
	file: 'index.js'
}

const tests_dest = {
	dir: 'build/tests/'
}

const options_esbuild = {
	bundle: true,
	minify: true,
	platform: 'node',
	target: 'esnext',
	format: 'cjs',
	plugins: [
		TsconfigPathsPlugin({}),
		NodeResolvePlugin({
			extensions: ['.ts', '.js'],
			onResolved: (resolved) => {
				if (resolved.includes('node_modules')) {
					return {
						external: true,
					}
				}
				return resolved
			},
		}),
	]
}

const options_typescript = {
	declaration: true
}

const project = ts.createProject('tsconfig.json', options_typescript)

gulp.task('source:build', () =>
	gulp.src(source_source)
		.pipe(esbuild({
			...options_esbuild,
			...{
				outfile: source_dest.file
			}
		}))
		.pipe(gulp.dest(source_dest.dir))
)

gulp.task('source:declare', () =>
	gulp.src(source_source)
		.pipe(project())
		.dts.pipe(gulp.dest(source_dest.dir))
)

gulp.task('tests:build', () =>
	gulp.src(tests_source)
		.pipe(esbuild({
			...options_esbuild,
			...{
				outfile: tests_dest.file,
				sourcemap: true,
				sourceRoot: '../..'
			}
		}))
		.pipe(gulp.dest(tests_dest.dir))
)

gulp.task('build', gulp.parallel('source:build', 'tests:build', 'source:declare'))
gulp.task('build.fast', gulp.parallel('source:build', 'tests:build'))
gulp.task('build.source', gulp.parallel('source:build', 'source:declare'))
gulp.task('build.source-fast', gulp.task('source:build'))
gulp.task('build.tests', gulp.task('tests:build'))
gulp.task('build.tests-fast', gulp.task('tests:build'))
