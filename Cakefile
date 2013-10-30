require 'flour'

task 'build:styl', ->
	compile 'styl/main.styl', 'css/main.css'

task 'watch', ->
	invoke 'build:styl'
	watch 'styl/*.styl', -> invoke 'build:styl'