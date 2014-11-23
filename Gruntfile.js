module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			all: ['Gruntfile.js', 'app/**/*.js'],
			options: {
				jshintrc: true
			}
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
				tasks: ['jshint', 'concat'],
				options: { spawn: false }
			},
			styles: {
				files: ['scss/**/*.scss'],
				tasks: ['sass'],
				options: { spawn: false }
			}
		},

		copy: {
			build: {
				files: [
					{ expand: true, src: ['dist/**'], dest: 'built_app/' },
					{ expand: true, src: ['components/**'], dest: 'built_app/' },
					{ expand: true, src: ['fonts/**'], dest: 'built_app/' },
					{ expand: true, src: ['images/**'], dest: 'built_app/' },
					{ expand: true, src: ['node_modules/**'], dest: 'built_app/' },
					{ expand: true, src: ['server/**'], dest: 'built_app/' },
					{ expand: true, src: ['templates/**'], dest: 'built_app/' },

					{ expand: true, src: ['atom-app.html'], dest: 'built_app/' },
					{ expand: true, src: ['atom-app.js'], dest: 'built_app/' },
					{ expand: true, src: ['package.json'], dest: 'built_app/' },
					{ expand: true, src: ['LICENSE'], dest: 'built_app/' }
				],
			},
		},

		clean: {
			build: ['built_app/node_modules/grunt*'],
			build_after: ['built_app/*']
		},

		'build-atom-shell-app': {
			options: {
				platforms: ['darwin', 'win32', 'linux'],
				app_dir: 'built_app'
			}
		},

		chmod: {
			options: {
				mode: '755'
			},
			build: {
				src: [
					'build/linux/atom-shell/atom',
					'build/darwin/atom-shell/Atom.app/Contents/MacOS/Atom'
				]
			}
		},

		rename: {
			osx: {
				src: 'build/darwin/atom-shell/Atom.app',
				dest: 'build/darwin/atom-shell/dripdownode.app'
			},
			linux: {
				src: 'build/linux/atom-shell/atom',
				dest: 'build/linux/atom-shell/dripdownode',
			},
			windows: {
				src: 'build/win32/atom-shell/atom.exe',
				dest: 'build/win32/atom-shell/dripdownode.exe',
			}
		},

		auto_install: {
			local: {}
		},
	});

	[
		'grunt-contrib-jshint',
		'grunt-contrib-concat',
		'grunt-contrib-sass',
		'grunt-contrib-watch',
		'grunt-notify',
		'grunt-contrib-copy',
		'grunt-contrib-clean',
		'grunt-chmod',
		'grunt-rename',
		'grunt-contrib-compress',
		'grunt-auto-install',
		'grunt-atom-shell-app-builder'
	].forEach(function(task) { grunt.loadNpmTasks(task); });

	var allButWatch = ['jshint', 'concat', 'sass'];
	var all = allButWatch.concat('watch');
	grunt.registerTask('nowatch', allButWatch);
	grunt.registerTask('default', all);

	grunt.registerTask('build', allButWatch.concat(
		'auto_install',
		'copy:build',
		'clean:build',
		'build-atom-shell-app'
	));

	grunt.registerTask('package', [
		'chmod:build',
		'rename',
		'clean:build_after'
	]);
};