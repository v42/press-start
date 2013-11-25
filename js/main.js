(function(){

	var state = "start"
	  , now = 0
	  , time = 0
	  , dt = 0
	  , gamepad = {}
	  , timer
	  , buttons = {
	  		a: {id: 0}
	  	  , b: {id: 1}
	  	  , x: {id: 2}
	  	  , y: {id: 3}
	  	  , lb: {id: 4}
	  	  , rb: {id: 5}
	  	  , lt: {id: 6}
	  	  , rt: {id: 7}
	  	  , select: {id: 8}
	  	  , start: {id: 9}
	  	  , leftStick: {id: 10}
	  	  , rightStick: {id: 11}
	  	  , up: {id: 12}
	  	  , down: {id: 13}
	  	  , left: {id: 14}
	  	  , right: {id: 15}
	  	}
	  , domButtons = []
	  , BUTTON_THRESHOLD = 0.05
	  , AXIS_THRESHOLD = 0.08
	  , currentSlide = 1
	  , totalSlides = document.querySelectorAll('section').length
	  , changingSlides = false
	  , slidesLoop = {}
	  , special = []

	function init() {
		gpMap()
		tagSlides()
		smStart()
		keyboardBinds()

		heartbeat()
		console.log("it's on! :)")
	}

	window.onload = function() {
		init()
	}

	function gpMap() {
		_.each(buttons, function(button, name) {
			domButtons[name] = document.querySelectorAll('.button.' + name)[0]
		})
	}

	function tagSlides() {
		_.each(document.querySelectorAll('section'), function(elm, idx){
			elm.setAttribute("id", "slide-" + (idx + 1))
			if(elm.dataset.special) {
				special[elm.dataset.special] = idx + 1
			}
		})
	}

	function keyboardBinds() {
		window.onkeypress = function(e) {
			var evt = new CustomEvent("keyPress", {detail:{key: e.keyCode}})
			document.body.dispatchEvent(evt)
		}

		window.onkeyup = function(e) {
			var evt = new CustomEvent("keyUp", {detail:{key: e.keyCode}})
			document.body.dispatchEvent(evt)
		}

		window.onkeydown = function(e) {
			var evt = new CustomEvent("keyDown", {detail:{key: e.keyCode}})
			document.body.dispatchEvent(evt)
		}

		document.body.addEventListener("keyUp", function(e) {
			if(e.detail.key == 79) prevSlide()
			if(e.detail.key == 80) nextSlide()
		})
	}

	function smStart() {
		soundManager.setup({
			url: 'swf/'
		  , flashVersion: 9
		  , debugMode: false
		  , onready: function() {
				soundManager.createSound({
					id: 'pause',
					url: 'assets/mp3/03 Pause.mp3',
					autoLoad: true,
					loops: 999,
					volume: 0,
					autoPlay: false
				})
			}
		})
	}

	function slides() {
		if(released('rb')) {
			nextSlide()
		}

		if(released('lb')) {
			prevSlide()
		}

		if(slidesLoop[currentSlide]) {
			slidesLoop[currentSlide]()
		}
	}

	function nextSlide() {
		if(currentSlide < totalSlides && !changingSlides) {
			changingSlides = true
			leaveCurrentSlide(function(){
				_.defer(function(){
					currentSlide += 1
					enterCurrentSlide()
				})
			})
		}
	}

	function prevSlide() {
		if(currentSlide > 1 && !changingSlides) {
			changingSlides = true
			leaveCurrentSlide(function() {
				_.defer(function(){
					currentSlide -= 1
					enterCurrentSlide()
				})
			})
		}
	}

	function enterCurrentSlide() {
		switch(currentSlide) {
			case 1:
				document.querySelector('.gamepad').className = 'gamepad'
				document.querySelector('#slide-1 h1').className = 'blink'
				state = 'start'
				break
			case 2:
				state = 'slides'
				break
			case special['dtloop']:
				initDtLoop()
				break
			case special['deltatime']:
				initLemmingDt()
				break
			case special['keypress']:
				initLemmingKp()
				break
			case special['keyboard']:
				initLemmingKeyboard()
				break
			case special['gamepadLemming']:
				initGamepadLemming()
				break
			case special['gamepad']:
				document.querySelector('.gamepad').className = 'gamepad'
				break
		}
		document.getElementById('slide-' + currentSlide).className = 'current'
		changingSlides = false
	}

	function leaveCurrentSlide(callback) {
		var timeout = 0
		switch(currentSlide) {
			case 1:
				document.querySelector('.gamepad').className = 'gamepad mini'
				document.querySelector('#slide-1 h1').className = 'blink faster'
				timeout = 2000
				break
			case special['gamepad']:
				document.querySelector('.gamepad').className = 'gamepad mini'
				timeout = 2000
				break
		}
		window.setTimeout(function(){
			document.getElementById('slide-' + currentSlide).className = ''
			callback()
		}, timeout)
	}

	function initGamepadLemming() {
		var lemming = document.querySelector('#slide-' + special['gamepadLemming'] + ' .lemming'),
			lemmingLeft = 400,
			lemmingSpeed = 1000/60
		
		lemming.className = 'lemming'

		slidesLoop['gamepadLemming'] = function() {
			var gpa = gamepad && gamepad.axes[0]
			if(gpa && (gpa > AXIS_THRESHOLD || gpa < -AXIS_THRESHOLD)) {
				if(gpa > 0) {
					lemmingLeft += lemmingSpeed * gpa
					lemming.className = 'lemming'
				} else {
					lemmingLeft -= lemmingSpeed * -gpa
					lemming.className = 'lemming flip'
				}
			}
			lemming.setAttribute("style", "left: " + lemmingLeft + "px")
		}
	}

	function initLemmingDt() {
		var lemming = document.querySelector('#slide-' + special['deltatime'] + ' .lemming'),
			speedSpan = document.querySelector('#slide-' + special['deltatime'] + ' .speed'),
			lemmingLeft = 0,
			lemmingSpeed = 200,
			lemmingDirection = 'r',
			elapsedTime = 0,
			pixelsMoved = 0
		
		lemming.className = 'lemming'

		slidesLoop[special['deltatime']] = function() {

			var variation = (lemmingSpeed * dt)/1000

			elapsedTime += dt
			pixelsMoved += variation
			if(elapsedTime > 1000) {
				pixelsMoved = pixelsMoved | 0
				speedSpan.innerHTML = pixelsMoved
				elapsedTime = elapsedTime - 1000
				pixelsMoved = 0
			}

			if(lemmingDirection == 'r') {
				lemmingLeft += variation
				if(lemmingLeft > 800) {
					lemmingDirection = 'l'
					lemming.className = 'lemming flip'
				}
			} else {
				lemmingLeft -= variation
				if(lemmingLeft < 0) {
					lemmingDirection = 'r'
					lemming.className = 'lemming'
				}
			}
			
			lemming.setAttribute("style", "left: " + lemmingLeft + "px")
		}
	}

	function initLemmingKp() {
		var lemming = document.querySelector('#slide-' + special['keypress'] + ' .lemming'),
			lemmingLeft = 400,
			lemmingSpeed = 50,
			lemmingDirection = ''
		
		lemming.className = 'lemming'
		lemming.setAttribute("style", "left: " + lemmingLeft + "px")

		document.body.addEventListener("keyDown", function(e) {
			switch(e.detail.key) {
				case 37:
					lemmingLeft -= lemmingSpeed
					lemming.className = 'lemming flip'
					break
				case 39:
					lemmingLeft += lemmingSpeed
					lemming.className = 'lemming'
					break
			}
			lemming.setAttribute("style", "left: " + lemmingLeft + "px")
		})
	}

	function initLemmingKeyboard() {
		var keys = [],
			lemming = document.querySelector('#slide-' + special['keyboard'] + ' .lemming'),
			lemmingLeft = 0,
			lemmingSpeed = 200,
			lemmingDirection = 'r'
		
		lemming.className = 'lemming'

		var keys = {
			37: {state: false, previousState: false},
			39: {state: false, previousState: false}
		}

		document.body.addEventListener("keyDown", function(e) {
			if(keys[e.detail.key]) {
				keys[e.detail.key].previousState = keys[e.detail.key].state
				keys[e.detail.key].state = true
			}
		})

		document.body.addEventListener("keyUp", function(e) {
			if(keys[e.detail.key]) {
				keys[e.detail.key].previousState = keys[e.detail.key].state
				keys[e.detail.key].state = false
			}
		})

		slidesLoop[special['keyboard']] = function() {

			if(keys[39].state && !keys[37].state) {
				lemmingLeft += (lemmingSpeed * dt)/1000
				lemming.className = 'lemming'
			} else if(keys[37].state && !keys[39].state){
				lemmingLeft -= (lemmingSpeed * dt)/1000
				lemming.className = 'lemming flip'
			}
			
			lemming.setAttribute("style", "left: " + lemmingLeft + "px")
		}
	}

	function initDtLoop() {
		var dtspan = document.querySelector('#slide-' + special['dtloop'] + ' .dtcounter span')
		slidesLoop[special['dtloop']] = function() {
			dtspan.innerHTML = dt
		}
	}

	function updateGamepad() {
		_.each(buttons, function(button, name) {
			if(gamepad) {
				button.previousState = button.state
				button.state = gamepad.buttons[button.id]
				
				if(name == "lt" || name == "rt") {
					if(button.state > BUTTON_THRESHOLD) {
						domButtons[name].setAttribute("style","height:" + ((30 * (1 - button.state)) + 10) + "px")
					} else {
						domButtons[name].setAttribute("style","height:30px");
					}
				} else {
					domButtons[name].className = "button " + name + (button.state ? " pressed" : "")
				}
			} else {
				button.state = 0
				button.previousState = 0
			}
		})

		if(gamepad) {
			domButtons['leftStick'].setAttribute("style", "left:" + (3 + (20 * gamepad.axes[0])) + "px; top: "+ (3 + (10 * gamepad.axes[1])) + "px")
			domButtons['rightStick'].setAttribute("style", "left:" + (3 + (20 * gamepad.axes[2])) + "px; top: "+ (3 + (10 * gamepad.axes[3])) + "px")
		}
	}

	// <3 Weezer
	// http://youtu.be/69vdVdYvYM0
	function heartbeat() {
		gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0]

		now = new Date().getTime()
		dt = now - (time || now)
		time = now

		updateGamepad()

		switch(state) {
			case "start":
				pressStart()
				break
			default:
				slides()
				break
		}

		requestAnimationFrame(heartbeat)
	}

	function pressed(button) {
		return !buttons[button].previousState && buttons[button].state
	}

	function released(button) {
		return buttons[button].previousState && !buttons[button].state
	}

	function pressStart() {
		if(released('start')) {
			nextSlide()
		}
	}

})()