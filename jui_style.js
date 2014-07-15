$(document).ready(function () {
	// Check availability of File API
	if (isAPIAvailable()) {
        $("#files").bind("change", handleFileSelect);
    }
	
	// Format buttons
	$(".buttons").button();
	
	// Format text box
	$("input").addClass("ui-corner-all");
	
	// Format drop down
	$("select").addClass("ui-corner-all");
	
});


