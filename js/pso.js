function PSOParticle(pso) {

	this.position = [];
	this.velocity = [];
	
	this.bestPosition = [];
	this.bestLocalValue = Number.MAX_VALUE;
	
	this.pso = pso;
	
	this.evaluate = function() {
		var result = pso.evaluateFormula(this.position);
		
		if (result < this.bestLocalValue) {
			this.bestPosition = this.positions.slice(0);
			this.bestLocalValue = result;
		}
		
		return result;
	};
	
}

function PSOSystem(numberOfParticles, numberOfIntervals, cCognitive, cSocial, positionRestriction) {
	
	this.positionRestriction = positionRestriction;
	this.velocityRestriction = [];
	
	this.componentCognitive = cCognitive;
	this.componentSocial = cSocial;
	
	this.particles = [];
	
	this.bestPosition = [];
	this.bestValue = Number.MAX_VALUE;
	
	for (var index = 0; index < numberOfParticles; index++) {
		var p = new PSOParticle(this);
		for (var indexX = 0; indexX < positionRestriction.length; indexX++) {
			p.position.push(0);
			p.velocity.push(0);
		}
		
		this.particles.push(p);
	}
	
	for (var index = 0; index < positionRestriction.length; index++) {
		var v1 = (positionRestriction[index][0] - positionRestriction[index][1]) / numberOfIntervals;
		var v2 = (positionRestriction[index][1] - positionRestriction[index][0]) / numberOfIntervals;
		
		this.velocityRestriction.push([v1, v2]);
	}
	
	this.init = function() {
		this.bestValue = Number.MAX_VALUE;
	
		for (var indexP = 0; indexP < this.particles.length; indexP++) {
			for (var indexR = 0; indexR < this.positionRestriction.length; indexR++) {
				this.particles[indexP].position[indexR] = this.positionRestriction[indexR][0] + Math.random() * (this.positionRestriction[indexR][1] - this.positionRestriction[indexR][0]);
				this.particles[indexP].velocity[indexR] = this.velocityRestriction[indexR][0] + Math.random() * (this.velocityRestriction[indexR][1] - this.velocityRestriction[indexR][0]);
			}
			
			var resultParticle = this.particles[indexP].evaluate();
			if (resultParticle < this.bestValue) {
				this.bestPosition = this.particles[indexP].slice(0);
				this.bestValue = resultParticle;
			}
		}
	};
	
	this.execute = function(maxSteps) {
		var counter = 0;
		
		init();
		
		while (counter < maxSteps) {
			counter++;
			
			for (var indexP = 0; indexP < this.particles.length; indexP++) {
				for (var indexR = 0; indexR < this.positionRestriction.length; indexR++) {
					
				}
			}
		}
	};
	
}