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
	  	  , lt: {id: 4}
	  	  , rt: {id: 5}
	  	  , lb: {id: 6}
	  	  , rb: {id: 7}
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

	function init() {
		gpMap()

		heartbeat()
		console.log("it's on! :)")
	}


	function gpMap() {
		_.each(buttons, function(button, name) {
			domButtons[name] = document.querySelectorAll('.button.' + name)[0]
		})
	}

	function updateGamepad() {
		_.each(buttons, function(button, name) {
			if(gamepad) {
				button.previousState = button.state
				button.state = gamepad.buttons[button.id]
				
				if(name == "lb" || name == "rb") {
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
		}

		requestAnimationFrame(heartbeat)
	}

	function isPressed(button) {
		return !buttons[button].previousState && buttons[button].state
	}

	function pressStart() {
		if(isPressed('start')) {
			changeState('selectScreen')
		}
	}

	function changeState(newState){
		leaveCurrentState(function() {
			enterNewState(newState)
		})
	}

	function leaveCurrentState(callback) {
		callback()
	}

	function enterNewState(newState) { 
		console.log('enterNewState: ' + newState)
	}

	window.onhashchange = function() {
		var state = location.hash.replace('#/', '')
		changeState(state)
	}

	init()
})()