$(document).ready(function(){
	$(".glyphicon-info-sign").popover({trigger: "hover"});
	
	var btnExecute = $("#btnExecute");
	var btnDeposit = $("#btnDepositPheromone");
	var btnNextIteration = $("#btnNextIteration");
	var btnShowBestPath = $("#btnShowBestPath");
	var labelResultBestInfo = $("#result-iteration-best-info");
	var labelResultBestInfoCost = $("#result-iteration-best-info-cost");
	
	var panelConfigurations = $("#panel-configurations").find(".panel-body");
	var panelResult = $("#panel-result");
	var panelResultConfig = $(".panel-result-config");
	
	$("#resultCanvas").attr("width", panelResult.find(".panel-body").width() + "px");
	$("#resultCanvas").attr("height", (panelConfigurations.outerHeight() - panelResultConfig.outerHeight()) + "px");
	
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
	
	btnExecute.click(function() {
	});
});