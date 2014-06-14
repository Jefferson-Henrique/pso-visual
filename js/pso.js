function PSOParticle(pso) {

	this.position = [];
	this.velocity = [];
	
	this.bestPosition = [];
	this.bestLocalValue = Number.MAX_VALUE;
	
	this.pso = pso;
	
	this.evaluate = function() {
		var result = pso.evaluateFormula(this.position);
		
		if (result < this.bestLocalValue) {
			this.bestPosition = this.position.slice(0);
			this.bestLocalValue = result;
		}
		
		return result;
	};
	
}

function PSOSystem(numberOfParticles, numberOfIntervals, cCognitive, cSocial, positionRestriction, expressionFormula, psoTypeParams) {
	
	this.positionRestriction = positionRestriction;
	this.velocityRestriction = [];
	
	this.componentCognitive = cCognitive;
	this.componentSocial = cSocial;
	
	this.psoTypeParams = psoTypeParams;
	
	this.particles = [];
	
	this.bestPosition = [];
	this.bestValue = Number.MAX_VALUE;
	
	this.resultStep = [];
	
	this.expression = Parser.parse(expressionFormula); 
	
	for (var index = 0; index < numberOfParticles; index++) {
		var p = new PSOParticle(this);
		for (var indexX = 0; indexX < positionRestriction.length; indexX++) {
			p.position.push(0);
			p.velocity.push(0);
			p.bestPosition.push(0);
		}
		
		this.particles.push(p);
	}
	
	for (var index = 0; index < positionRestriction.length; index++) {
		this.bestPosition.push(0);
		
		var v1 = (positionRestriction[index][0] - positionRestriction[index][1]) / numberOfIntervals;
		var v2 = (positionRestriction[index][1] - positionRestriction[index][0]) / numberOfIntervals;
		
		this.velocityRestriction.push([v1, v2]);
	}
	
	this.init = function() {
		this.resultStep.length = 0;
		this.bestValue = Number.MAX_VALUE;
	
		for (var indexP = 0; indexP < this.particles.length; indexP++) {
			for (var indexR = 0; indexR < this.positionRestriction.length; indexR++) {
				this.particles[indexP].position[indexR] = this.positionRestriction[indexR][0] + Math.random() * (this.positionRestriction[indexR][1] - this.positionRestriction[indexR][0]);
				this.particles[indexP].velocity[indexR] = this.velocityRestriction[indexR][0] + Math.random() * (this.velocityRestriction[indexR][1] - this.velocityRestriction[indexR][0]);
			}
			
			this.resultStep.push([this.particles[indexP].position.slice(0)]);
			
			var resultParticle = this.particles[indexP].evaluate();
			if (resultParticle < this.bestValue) {
				this.bestPosition = this.particles[indexP].position.slice(0);
				this.bestValue = resultParticle;
			}
		}
		
		this.resultStep.push([this.bestPosition.slice(0)]);
	};
	
	this.evaluateFormula = function(positions) {
		var params = {x: positions[0], y: positions[1]};
		
		return this.expression.evaluate(params);
	};
	
	this.execute = function(maxSteps, psoType) {
		var counter = 0;
		
		this.init();
		
		while (counter < maxSteps) {
			counter++;
			
			for (var indexP = 0; indexP < this.particles.length; indexP++) {
				for (var indexR = 0; indexR < this.positionRestriction.length; indexR++) {
					if (psoType == "DEFAULT") {
						this.particles[indexP].velocity[indexR] = this.particles[indexP].velocity[indexR] + 
							this.componentCognitive * Math.random() * (this.particles[indexP].bestPosition[indexR] - this.particles[indexP].position[indexR]) + 
							this.componentSocial * Math.random() * (this.bestPosition[indexR] - this.particles[indexP].position[indexR])
					} else if (psoType == "WEIGHT_LINEAR_DESC") {
						var weightMin = this.psoTypeParams["WEIGHT_MIN"];
						var weightMax = this.psoTypeParams["WEIGHT_MAX"];
						
						var weight = weightMax - ((weightMax - weightMin) / maxSteps) * counter;
						
						this.particles[indexP].velocity[indexR] = weight * this.particles[indexP].velocity[indexR] + 
							this.componentCognitive * Math.random() * (this.particles[indexP].bestPosition[indexR] - this.particles[indexP].position[indexR]) + 
							this.componentSocial * Math.random() * (this.bestPosition[indexR] - this.particles[indexP].position[indexR])
					} else if (psoType == "CONSTRICTION") {
						this.particles[indexP].velocity[indexR] = this.particles[indexP].velocity[indexR] + 
							this.componentCognitive * Math.random() * (this.particles[indexP].bestPosition[indexR] - this.particles[indexP].position[indexR]) + 
							this.componentSocial * Math.random() * (this.bestPosition[indexR] - this.particles[indexP].position[indexR])
						
						this.particles[indexP].velocity[indexR] *= this.psoTypeParams["CONSTRICTION"];
					}
					
					if (this.particles[indexP].velocity[indexR] < this.velocityRestriction[indexR][0]) {
						this.particles[indexP].velocity[indexR] = this.velocityRestriction[indexR][0]
					} else if (this.particles[indexP].velocity[indexR] > this.velocityRestriction[indexR][1]) {
						this.particles[indexP].velocity[indexR] = this.velocityRestriction[indexR][1]
					}
					
					this.particles[indexP].position[indexR] = this.particles[indexP].position[indexR] + this.particles[indexP].velocity[indexR];
					
					if (this.particles[indexP].position[indexR] < this.positionRestriction[indexR][0]) {
						this.particles[indexP].position[indexR] = this.positionRestriction[indexR][0]
					} else if (this.particles[indexP].position[indexR] > this.positionRestriction[indexR][1]) {
						this.particles[indexP].position[indexR] = this.positionRestriction[indexR][1]
					}
					
				}
				
				this.resultStep[indexP].push(this.particles[indexP].position.slice(0));
				
				var resultParticle = this.particles[indexP].evaluate();
				if (resultParticle < this.bestValue) {
					this.bestPosition = this.particles[indexP].position.slice(0);
					this.bestValue = resultParticle;
				}
				
			}
			
			this.resultStep[this.resultStep.length-1].push(this.bestPosition.slice(0));
		}
		
		return this.resultStep;
	};
}

function test() {
	var pso = new PSOSystem(8, 5, 2, 2, [[-6, 8], [-10, 7]], "x^2 - x*y + y^2 - 3*y", null);
	console.log(pso.execute(150, "DEFAULT"));
}