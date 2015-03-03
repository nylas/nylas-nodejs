module.exports = (grunt) ->
  grunt.initConfig
    coffee:
      glob_to_multiple:
        expand: true,
        flatten: false,
        cwd: '',
        src: ['*.coffee', 'models/*.coffee'],
        dest: 'lib/',
        ext: '.js'
      
    jasmine_node:
      coffee: 'true'
      extensions: 'coffee'
    
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-jasmine-node-coffee'

  grunt.registerTask 'default', ['coffee', 'jasmine_node']