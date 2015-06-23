var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlreplace = require('gulp-html-replace');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var streamify = require('gulp-streamify');
var compass = require('gulp-compass');

var path = {
	HTML: 'src/index.html',
	SASS: 'src/sass/app.scss',
	MINIFIED_OUT: 'build.min.js',
	OUT: 'build.js',
	DEST: 'dist',
	DEST_BUILD: 'dist/build',
	DEST_SRC: 'dist/src',
	DEST_CSS: 'dist/src/css',
	ENTRY_POINT: './src/js/components/Cal.js'
};

gulp.task('copy', function() {
	gulp.src(path.HTML)
		.pipe(gulp.dest(path.DEST));
	});

gulp.task('watch', function() {
	gulp.watch(path.HTML, ['copy']);
	gulp.watch(path.SASS, ['compass']);

	var watcher = watchify(browserify({
		entries: [path.ENTRY_POINT],
		transform: [reactify],
		debug: true,
		cache: {}, packageCache: {}, fullPaths: true
		}));

	return watcher.on('update', function() {
		watcher.bundle()
			.pipe(source(path.OUT))
			.pipe(gulp.dest(path.DEST_SRC))
			console.log('Updated');
		})
	.bundle()
	.pipe(source(path.OUT))
	.pipe(gulp.dest(path.DEST_SRC));
});

gulp.task('compass', function() {

	gulp.src('./src/sass/*.scss')
		.pipe(compass({
			config_file: './config.rb',
			css: 'src/css',
			sass: 'src/sass'
			}))
		.pipe(gulp.dest(path.DEST_CSS));

});

gulp.task('default', ['watch', 'compass']);

gulp.task('build', function() {
	browserify({
		entries: [path.ENTRY_POINT],
		transform: [reactify]
		})
	.bundle()
	.pipe(source(path.MINIFIED_OUT))
	.pipe(streamify(uglify(path.MINIFIED_OUT)))
	.pipe(gulp.dest(path.DEST_BUILD));
});

gulp.task('replaceHTML', function() {
	gulp.src(path.HTML)
	.pipe(htmlreplace({
		'css': 'src/css/app.css',
		'js': 'build/' + path.MINIFIED_OUT
		}))
	.pipe(gulp.dest(path.DEST));
});

gulp.task('production', ['replaceHTML', 'build', 'compass']);
