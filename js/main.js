(function(){

	var state = "start"
	  , now = 0
	  , time = 0
	  , dt = 0
	  , gamepad = {}
	  , timer
	  , buttons = {
	  		a: 0
	  	  , b: 1
	  	  , x: 2
	  	  , y: 3
	  	  , lt: 4
	  	  , rt: 5
	  	  , lb: 6
	  	  , rb: 7
	  	  , select: 8
	  	  , start: 9
	  	  , leftStick: 10
	  	  , rightStick: 11
	  	  , up: 12
	  	  , down: 13
	  	  , left: 14
	  	  , right: 15
	  	}
	  , domButtons = []
	  , buttonList = ['a', 'b', 'x', 'y', 'lt', 'rt', 'select', 'start', 'leftStick', 'rightStick', 'up', 'down', 'left', 'right']

	function init() {
		gpMap()

		heartbeat()
		console.log("it's on! :)")
	}


	function gpMap() {
		buttonList.map(function(btn) {
			domButtons[btn] = document.querySelectorAll('.button.' + btn)[0]
		})
	}


	var bacon = false

	function updateGamepad() {
		buttonList.map(function(btn) {
			if(buttonPressed(btn)) {
				domButtons[btn].className = "button pressed " + btn
			} else {
				domButtons[btn].className = "button " + btn
			}
			if(!bacon) console.log(domButtons[btn])
		})
		bacon = true
	}

	function buttonPressed (buttonName) {
		var buttonId = buttons[buttonName]
		return gamepad && gamepad.buttons[buttonId]
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

	function pressStart() {
		if(buttonPressed('start')) {
			chageState('selectScreen')
		}
	}

	function changeState(newState){
		leaveCurrentState(newState)
	}

	function leaveCurrentStage(newState) {

	}

	function enterNewState(newState) { 

	}

	window.onhashchange = function() {
		var state = location.hash.replace('#/', '')
		changeState(state)
	}

	init()
})()