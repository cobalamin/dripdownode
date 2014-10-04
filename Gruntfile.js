module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			all: ['Gruntfile.js', 'app/**/*.js']
		},

		concat: {
			options: {
				separator: ';',
				sourceMap: true
			},
			app: {
				src: ['app/**/*.js'],
				dest: 'dist/app.js'
			}
		},

		sass: {
			app: {
				options: {
					style: 'expanded',
					sourcemap: 'auto'
				},
				files: {
					'dist/app.css': 'scss/app.scss'
				}
			}
		},

		watch: {
			scripts: {
				files: ['app/**/*.js'],
				tasks: ['jshint'],
				options: { spawn: false }
			},
			styles: {
				files: ['scss/**/*.scss'],
				tasks: ['sass'],
				options: { spawn: false }
			}
		}
	});

	[
		'grunt-contrib-jshint',
		'grunt-contrib-concat',
		'grunt-contrib-sass',
		'grunt-contrib-watch',
		'grunt-notify'
	].forEach(function(task) { grunt.loadNpmTasks(task); });

	var allButWatch = ['jshint', 'concat', 'sass'];
	var all = allButWatch.concat('watch');
	grunt.registerTask('nowatch', allButWatch);
	grunt.registerTask('default', all);
};