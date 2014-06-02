// Detect customer pool and extract unique values after subsetting data
function detectCustomer() {
	$("#customer_filter").empty();
	$("#customer_filter").append("<option value='all'>All Customers</option>");
	var data = rawDataObject.currentData,
		customerName = rawDataObject.customerName,
		customerData = extractValue(data, customerName),
		customerList = customerData.filter(detectUnique);
	for (var i = 0; i < customerList.length; i++) {
		$("#customer_filter").append("<option value=" + customerList[i] + ">" + customerList[i] + "</option>");
	}
	$("#customize_field").show();
}

// Filter customer on scatter plot
function filterCustomer() {
	var filter = $("#customer_filter").val();
	if (filter == "all") {
		d3.selectAll(".dot").style("opacity", 1);
	} else {
		d3.selectAll(".dot").style("opacity", 0.1);
		d3.selectAll("#dot_" + filter).style("opacity", 1);
	}
}

// Add input options for customer ask price
function addAskPrice() {
	$(".externalObject").remove();
	var data = rawDataObject.currentData,
		quarterName = rawDataObject.quarterName,
		quarterData = extractValue(data, quarterName),
		quarterList = quarterData.filter(detectUnique),
		divText = "";
	divText += "<div id=new_ask_price class=externalTextbox><b>Add New Point</b><br/>";
	divText += "<select id=ask_price_quarter><option value=''>Link to quarter:</option></select><br/>";
	divText += "<input type='text' id=ask_price_coord class=externalTextbox placeholder='enter coordinates' onchange=updateAskPrice()></input></div>";

	d3.select("svg").append("foreignObject")
		.attr("class", "externalObject")
		.attr("x", (d3.mouse(this)[0] - 20) + "px")
		.attr("y", (d3.mouse(this)[1] - 15) + "px")
		.attr("width", 200)
		.attr("height", 100)
		.append("xhtml:div")
		.html(divText);
	
	for (var i = 0; i < quarterList.length; i++) {
		$("#ask_price_quarter").append("<option value=" + quarterList[i] + ">" + quarterList[i] + "</option>");
	}
}

// Add actual ask price point
function updateAskPrice() {
	var xScale = rawDataObject.xScale,
        yScale = rawDataObject.yScale,
        settings = rawDataObject.settings,
		xMin = settings.xMin,
        xMax = settings.xMax,
		yMin = settings.yMin,
		yMax = settings.yMax,
		newCoord = $("#ask_price_coord").val().split(","),
        newAskX = parseFloat(newCoord[0]),
        newAskY = parseFloat(newCoord[1]);
	if ($("#ask_price_quarter").val() == "") {
		alert("Which quarter should be linked?");
	} else if (isNaN(newAskX) || isNaN(newAskY)) {
		alert("Invalid input!");
	} else if (newAskX <Math.pow(10, Math.floor(log10(xMin))) || newAskX > Math.pow(10, Math.ceil(log10(xMax))) || newAskY < 0.9 * yMin || newAskY > 1.1 * yMax) {
		alert("Input out of bound!");
	} else {
		var askPricePoint = d3.select("g").append("circle")
								.attr("id", "ask_point_" + $("#ask_price_quarter").val())
								.attr("r", 6.5)
								.attr("cx", xScale(newAskX))
								.attr("cy", yScale(newAskY))
								.style("zIndex", 10)
								.on("click", function() {d3.select(this).remove();})
								.on("mouseover", function(){})
								.on("mouseout", function(){});
		askPricePoint.transition().duration(500)
			.style("fill", "#f6eff7")
			.style("stroke", "black")
			.style("stroke-width", "2px");
		$("#new_ask_price").hide();
	}
}















