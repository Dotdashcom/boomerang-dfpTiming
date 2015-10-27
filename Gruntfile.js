var saveLicense = require('uglify-save-license');
module.exports = function(grunt) {

	grunt.initConfig({
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['bower_components/dfp-events/dfp.gpt.logger.override.js', 'src/dfp.events.caching.js'],
				dest: 'dist/dfp.gpt.logger.cached.js'
			}
		},
		copy: {
			main: {
				src: 'src/boomerang.dfp.timing.js',
				dest: 'dist/boomerang.dfp.timing.js'
			}
		},
		uglify: {
			options: {
				preserveComments: saveLicense
			},
			build: {
				src: 'dist/dfp.gpt.logger.cached.js',
				dest: 'dist/dfp.gpt.logger.cached.min.js'
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['concat', 'copy', 'uglify']);
};