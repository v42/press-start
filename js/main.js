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
	  , text

	function init() {
		gpMap()
		tagSlides()
		smStart()
		keyboardBinds()
		mouseBinds()

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
	
	function mouseBinds() {
		var clickys = document.getElementsByClassName('clicky')
		_.each(clickys, function(clicky) {
			clicky.addEventListener('click', function(e) {
				var obj = document.querySelector('.current .text')
				if(obj) {
					obj.innerHTML = 'elm:' + e.srcElement.tagName.toLowerCase() + '<br />X:' + e.offsetX + ' Y:' + e.offsetY
				}
			})
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
					autoPlay: true
				})

				soundManager.createSound({
					id: 'lemmings',
					url: 'assets/mp3/Lemmings - Rondo Alla Turca.mp3',
					autoLoad: true,
					loops: 1,
					autoPlay: false
				})

				soundManager.createSound({
					id: 'select',
					url: 'assets/mp3/Street Fighter - Selecting.mp3',
					autoLoad: true,
					loops: 1,
					autoPlay: false
				})

				soundManager.createSound({
					id: 'choose',
					url: 'assets/mp3/Street Fighter - Choose.mp3',
					autoLoad: true,
					loops: 1,
					autoPlay: false
				})
			}
		})
	}

	function smFade(soundId) {
		var sound = soundManager.getSoundById(soundId)
		var interval = window.setInterval(function() {
			if (sound.volume > 0) {
				sound.setVolume(sound.volume - 1)
			} else {
				soundManager.stop(soundId)
				window.clearInterval(interval)
			}
		}, 10)
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
				soundManager.play('pause')
				state = 'start'
				break
			case 2:
				smFade('pause')
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
			case special['canvasDash']:
				initCanvasDash()
				break
			case special['canvasDraw']:
				initCanvasDraw()
				break
			case special['svgDraw']:
				initSvgDraw()
				break
			case special['audio']:
				initAudio()
				break
			case special['soundManager']:
				initSoundManager()
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
			lemmingSpeed = 17
		
		lemming.className = 'lemming'

		slidesLoop[special['gamepadLemming']] = function() {
			if(gamepad) {
				var gpa = gamepad.axes[0]
				if(gpa > AXIS_THRESHOLD || gpa < -AXIS_THRESHOLD) {
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

	function initCanvasDash() {
		var canvas = document.querySelector('#slide-' + special['canvasDash'] + ' canvas')
		slidesLoop[special['canvasDash']] = function() {
			if(released('a')) {
				canvas.className = (canvas.className == 'dashed' ? '' : 'dashed')
			}
		}
	}

	function initCanvasDraw() {
		var canvas = document.querySelector('#slide-' + special['canvasDraw'] + ' canvas'),
			context = canvas.getContext('2d'),
			cw2 = 320,
			ch2 = 240,
			radius = 48,
			posX = cw2,
			posY = ch2,
			autoclean = true,
			drawing = true

		function draw() {
			context.beginPath()
			context.arc(posX, posY, radius, 0, 2 * Math.PI, false)
			context.fillStyle = 'cyan'
			context.fill()
			context.lineWidth = 5
			context.strokeStyle = 'magenta'
			context.stroke()
		}

		function erase() {
			context.clearRect(0, 0, canvas.width, canvas.height)
		}

		slidesLoop[special['canvasDraw']] = function() {
			if(released('a')) {
				erase()
				drawing = !drawing
			}
			if(released('b')) {
				autoclean = !autoclean
			}
			if(autoclean) {
				erase()
			}
			if(drawing && gamepad) {
				var gpax = gamepad.axes[0],
					gpay = gamepad.axes[1]

				if(gpax > AXIS_THRESHOLD || gpax < -AXIS_THRESHOLD) {
					posX = (gpax * cw2) + cw2
				}
				if(gpay > AXIS_THRESHOLD || gpay < -AXIS_THRESHOLD) {
					posY = (gpay * ch2) + ch2
				}
			}
			draw()
		}
	}

	function initSvgDraw() {
		var ball = document.querySelector('#slide-' + special['svgDraw'] + ' ellipse'),
			sw2 = 320,
			sh2 = 240

		slidesLoop[special['svgDraw']] = function() {
			if(gamepad) {
				var gpax = gamepad.axes[0],
					gpay = gamepad.axes[1]

				if(gpax > AXIS_THRESHOLD || gpax < -AXIS_THRESHOLD) {
					ball.setAttribute('cx', (gpax * sw2) + sw2)
				}
				if(gpay > AXIS_THRESHOLD || gpay < -AXIS_THRESHOLD) {
					ball.setAttribute('cy', (gpay * sh2) + sh2)
				}
			}
		}
	}

	function initAudio() {
		var context,
			bufferLoader,
			bufferList,
			hadouken,
			shoryuken,
			tatsumaki

		window.AudioContext = window.AudioContext || window.webkitAudioContext
		context = new AudioContext()

		bufferLoader = new BufferLoader(
			context,
			[
				'assets/wav/hadouken.wav',
				'assets/wav/shoryuken.wav',
				'assets/wav/tatsumaki.wav',
			],
			finishedLoading
		)

		bufferLoader.load()

		function finishedLoading(bl) {
			bufferList = bl
		}

		slidesLoop[special['audio']] = function() {
			if(pressed('a')) {
				hadouken = context.createBufferSource()
				hadouken.buffer = bufferList[0]
				hadouken.connect(context.destination)
				hadouken.start(0)
			}
			if(pressed('x')) {
				shoryuken = context.createBufferSource()
				shoryuken.buffer = bufferList[1]
				shoryuken.connect(context.destination)
				shoryuken.start(0)
			}
			if(pressed('b')) {
				tatsumaki = context.createBufferSource()
				tatsumaki.buffer = bufferList[2]
				tatsumaki.connect(context.destination)
				tatsumaki.start(0)
			}
		}
	}

	function initSoundManager() {
		
		var smLemmings = soundManager.getSoundById('lemmings')

		slidesLoop[special['soundManager']] = function() {
			if(pressed('x')) {
				soundManager.play('lemmings')
			}
			if(pressed('b')) {
				soundManager.stop('lemmings')
			}
			if(pressed('y')) {
				smLemmings.setVolume(smLemmings.volume + 10)
			}
			if(pressed('a')) {
				smLemmings.setVolume(smLemmings.volume - 10)
			}
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

function BufferLoader(context, urlList, callback) {
	this.context = context;
	this.urlList = urlList;
	this.onload = callback;
	this.bufferList = new Array();
	this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
	// Load buffer asynchronously
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";

	var loader = this;

	request.onload = function() {
		// Asynchronously decode the audio file data in request.response
		loader.context.decodeAudioData(
			request.response,
			function(buffer) {
				if (!buffer) {
					alert('error decoding file data: ' + url);
					return;
				}
				loader.bufferList[index] = buffer;

				if (++loader.loadCount == loader.urlList.length)
					loader.onload(loader.bufferList);
			},
			function(error) {
				console.error('decodeAudioData error', error);
			}
		);
	}

	request.onerror = function() {
		alert('BufferLoader: XHR error');
	}

	request.send();
}

BufferLoader.prototype.load = function() {
	for (var i = 0; i < this.urlList.length; ++i)
	this.loadBuffer(this.urlList[i], i);
}
