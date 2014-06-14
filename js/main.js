var PARTICLE_VELOCITY = 300;

$(document).ready(function(){
	$(".glyphicon-info-sign").popover({trigger: "hover"});
	
	var btnExecute = $("#btnExecute");
	
	var panelConfigurations = $("#panel-configurations").find(".panel-body");
	var panelResult = $("#panel-result");
	var panelResultConfig = $(".panel-result-config");
	
	var resultSpan = $("#result-answer");
	var resultSpanX = $("#result-answer-x");
	var resultSpanY = $("#result-answer-y");
	var resultSpanF = $("#result-answer-f");
	
	$("#resultCanvas").attr("width", panelResult.find(".panel-body").width() + "px");
	$("#resultCanvas").attr("height", (panelConfigurations.outerHeight() - panelResultConfig.outerHeight()) + "px");
	
	var stage = new createjs.Stage("resultCanvas");
	var containerParticles = new createjs.Container();
	stage.addChild(containerParticles);
	
	var mouseDownPosition, previousX, previousY;
	
	$("#resultCanvas").on("mousedown", function(event) {
		mouseDownPosition = [event.screenX, event.screenY];
		
		previousX = stage.x;
		previousY = stage.y;
	}).on("mouseup", function(event) {
		mouseDownPosition = null;
	}).on("mousemove", function(event) {
		if (mouseDownPosition) {
			stage.x = previousX + event.screenX - mouseDownPosition[0];
			stage.y = previousY + event.screenY - mouseDownPosition[1];
		}
	});
	
	var psoSystem = null;
	var resultPso = null;
	var numberOfIterations = 0;
	var allParticles = [];
	
	var diffX = null;
	var diffY = null;
	var restrictionPositions = [];
	
	function fixPosition(position) {
		var x = (position[0] - restrictionPositions[0][0]) * diffX;
		var y = (position[1] - restrictionPositions[1][0]) * diffY;
		
		return {x: x, y: y};
	};
	
	btnExecute.click(function() {
		resultSpan.show();
		allParticles.length = 0;
		containerParticles.removeAllChildren();
		
		var numberOfParticles = parseInt($("#data-particles").val());
		numberOfIterations = parseInt($("#data-iterations").val());
		var numberOfIntervals = 5;
		var formula = $("#data-formula").val();
		var compCognitive = parseFloat($("#data-comp-cognitive").val());
		var compSocial = parseFloat($("#data-comp-social").val());
		var restPosition = $("#data-restriction-position").val();
		var psoType = $("#data-psotype").val();
		
		restrictionPositions.length = 0;
		var splitted = restPosition.trim().split(";");
		for (var index = 0; index < splitted.length; index++) {
			var values = splitted[index].split(",");
			if (values.length == 2) {
				restrictionPositions.push([parseFloat(values[0]), parseFloat(values[1])]);
			}
		}
		
		diffX = stage.canvas.width / (restrictionPositions[0][1] - restrictionPositions[0][0]);
		diffY = stage.canvas.height / (restrictionPositions[1][1] - restrictionPositions[1][0]);
		
		var psoParams = {};
		psoParams["WEIGHT_MIN"] = 0.4;
		psoParams["WEIGHT_MAX"] = 0.9;
		psoParams["CONSTRICTION"] = 0.729844;
		
		psoSystem = new PSOSystem(numberOfParticles, numberOfIntervals, compCognitive, compSocial, restrictionPositions, formula, psoParams);
		resultPso = psoSystem.execute(numberOfIterations, psoType);
		console.log(resultPso);
		
		for (var index = 0; index < (numberOfParticles+1); index++) {
			var circle = new createjs.Shape();
			if (index < numberOfParticles) {
				circle.graphics.beginStroke("black").beginFill("white").drawCircle(0, 0, 15);
			} else {
				resultSpanX.text(resultPso[index][0][0]);
				resultSpanY.text(resultPso[index][0][1]);
				resultSpanF.text(psoSystem.evaluateFormula(resultPso[index][0]));
				circle.graphics.beginStroke("white").beginFill("blue").drawCircle(0, 0, 15);
			}
			
			var positionFixed = fixPosition(resultPso[index][0]);
			circle.x = positionFixed.x;
			circle.y = positionFixed.y;
			circle._nextNode = 1;
			circle._positions = resultPso[index];
			
			allParticles.push(circle);
			containerParticles.addChild(circle);
		}
	});
	
	function tick(event) {
		if (event.paused) {
			return;
		}
		
		var allHaveFinished = allParticles.length > 0;
		for (var index in allParticles) {
			var currentParticle = allParticles[index];

			if (currentParticle._nextNode < numberOfIterations) {
				allHaveFinished = false;
				
				var currentState = resultPso[index][currentParticle._nextNode - 1].slice(0);
				var positionFixed = fixPosition(currentState);
				currentState[0] = positionFixed.x;
				currentState[1] = positionFixed.y;
				
				var nextState = resultPso[index][currentParticle._nextNode].slice(0);
				positionFixed = fixPosition(nextState);
				nextState[0] = positionFixed.x;
				nextState[1] = positionFixed.y;
				
				
				var diffX = nextState[0] - currentParticle.x;
				var diffY = nextState[1] - currentParticle.y;
				var distance = Math.sqrt(diffX*diffX + diffY*diffY);
				
				var auxDistance = distance;
				if (auxDistance < 1) {
					diffX = nextState[0] - currentState[0];
					diffY = nextState[1] - currentState[1];
					distance = Math.sqrt(diffX*diffX + diffY*diffY);
					auxDistance = Math.sqrt(diffX*diffX + diffY*diffY);
				}
				
				var angleRadians = Math.asin(diffY / auxDistance);
				if (Number.isNaN(angleRadians)) {
					angleRadians = 0;
				}
				
				if (nextState[0] < currentState[0]) {
					angleRadians = Math.PI - angleRadians;
				}
				
				var angleDegree = angleRadians * (180/Math.PI);
				var cosAngle = Math.cos(angleRadians);
				var sinAngle = Math.sin(angleRadians);
				
				var amountX = event.delta/1000*PARTICLE_VELOCITY * cosAngle;
				if (Math.abs(amountX) < 0.001) {
					amountX = 0;
				}
				
				var amountY = event.delta/1000*PARTICLE_VELOCITY * sinAngle;
				if (Math.abs(amountY) < 0.001) {
					amountY = 0;
				}
				
				if (
						(amountX != 0 && 
								(
								(currentParticle.x <= nextState[0] && nextState[0] <= (currentParticle.x + amountX))
										 || 
								(currentParticle.x >= nextState[0] && nextState[0] >= (currentParticle.x + amountX))
								)
						) ||
						(amountY != 0 && 
								(
								(currentParticle.y >= nextState[1] && nextState[1] >= (currentParticle.y + amountY))
										||
								(currentParticle.y <= nextState[1] && nextState[1] <= (currentParticle.y + amountY))
								)
						)
					) {
					currentParticle.x = nextState[0];
					currentParticle.y = nextState[1];
					
					currentParticle._nextNode++;
					
					if (index == (allParticles.length - 1)) {
						resultSpanX.text(resultPso[index][currentParticle._nextNode-1][0]);
						resultSpanY.text(resultPso[index][currentParticle._nextNode-1][1]);
						resultSpanF.text(psoSystem.evaluateFormula(resultPso[index][currentParticle._nextNode-1]));
					}
				} else {
					currentParticle.x += amountX;
					currentParticle.y += amountY;
					
					currentParticle.rotation = angleDegree;
				}
			}
		}
		
		if (allHaveFinished) {
		}
		
		stage.update(event);
	}
	
	createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCH;
	createjs.Ticker.framerate = 30;
	createjs.Ticker.addEventListener("tick", tick);
});