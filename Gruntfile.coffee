module.exports = (grunt) ->
  grunt.initConfig
    coffee:
      compile:
        files:
          'lib/nilas.js': ['*.coffee', 'models/*.coffee']

    jasmine_node:
      coffee: 'true'
      extensions: 'coffee'
    
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-jasmine-node-coffee'

  grunt.registerTask 'default', ['coffee', 'jasmine_node']