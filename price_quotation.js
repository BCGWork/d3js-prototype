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

// Show all tooltips for current points
jQuery.fn.d3Click = function () {
	this.each(function (i, e) {
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		e.dispatchEvent(evt);
	});
};
function clickAll() {
	$(".dot").d3Click();
}

// Add input options for customer ask price
function addAskPrice(d) {
    $(".externalObject").remove();
	rawDataObject.newPointCategory = d;
	var divText = "";
    divText += "<div id=new_point_div class=externalTextbox><b>Add Point for:</b><br/>";
	divText += d + "<br/>";
	divText += "<select id=add_point_selector><option value='askPrice'>Customer Ask Price</option><option value='newPoint'>New Grid Point</option></select><br/>";
    divText += "<input type='text' id=new_point_coord class=externalTextbox placeholder='enter coordinates' onchange=addNewPoint()></input></div>";
	
    d3.select("svg").append("foreignObject")
        .attr("class", "externalObject")
        .attr("x", ($(".legend rect").attr("x") * 0.8) + "px")
        .attr("y", "50px")
        .attr("width", 200)
        .attr("height", 100)
        .append("xhtml:div")
        .html(divText);
}

// Add new points to grid
function addNewPoint() {
    var xScale = rawDataObject.xScale,
        yScale = rawDataObject.yScale,
		newPointCategory = rawDataObject.newPointCategory,
		pointData = rawDataObject.pointData,
        minRangeX = rawDataObject.minRangeX,
        maxRangeX = rawDataObject.maxRangeX,
        minRangeY = rawDataObject.minRangeY,
        maxRangeY = rawDataObject.maxRangeY,
		settings = rawDataObject.settings,
		xName = settings.xName,
        yName = settings.yName,
		format = d3.format(",f"),
		pointType = $("#add_point_selector").val(),
        newCoord = $("#new_point_coord").val().split(","),
        newX = parseFloat(newCoord[0]),
        newY = parseFloat(newCoord[1]),
		predX = 0,
		predY = 0,
		gridDev = 0;
	if (isNaN(newX) || isNaN(newY)) {
        alert("Invalid input!");
    } else if ((newX <= minRangeX & newX != -1) || newX > maxRangeX || (newY < minRangeY & newY != -1) || newY > maxRangeY) {
        alert("Input out of bound!");
    } else {
		// Initialize tooltip for new point
		var newPointTooltip = d3.select("#data_visualization").append("div").attr("class", "tooltip");
		// Calculate predicted y and grid deviation
		for (var i = 0; i < pointData.length; i++) {
			if (pointData[i]["category"] == newPointCategory) {
				if (pointType == "askPrice") {
					predY = pointData[i]["intercept"] + pointData[i]["slope"] * log10(newX);
					gridDev = (newY - predY) / predY;
				} else {
					if (newX == -1) {
						predY = newY;
						predX = Math.pow(10, (predY - pointData[i]["intercept"]) / pointData[i]["slope"]);
					}
					if (newY == -1) {
						predX = newX;
						predY = pointData[i]["intercept"] + pointData[i]["slope"] * log10(predX);
					}
				}
			}
		}
		// Add new point to svg
		if (pointType == "askPrice") { // if new customer ask price
			var newPoint = d3.select("g").append("g").attr("class", "newpoints").append("path").attr("d", d3.svg.symbol().type("diamond").size(100));
		} else { // if new grid point
			var newPoint = d3.select("g").append("g").attr("class", "newpoints").append("path").attr("d", d3.svg.symbol().type("square").size(100));
		}
		newPoint.attr("id", "new_point_" + newCoord[0].replace(/\.| |-/g, "_") + "_" + newCoord[1].replace(/\.| |-/g, "_"))
			.attr("class", "new_dot")
			.style("zIndex", 10)
            .style("fill", $("#legend_" + newPointCategory.replace(/'|;| /g, "") + " rect").attr("fill"))
            .style("stroke", "black")
            .style("stroke-width", "2px")
            .on("contextmenu", function () {
				d3.event.preventDefault(); // prevent right click menu from showing
				d3.select(this).remove(); // remove dot
				d3.select("#new_point_tooltip_" + newCoord[0].replace(/\.| |-/g, "_") + "_" + newCoord[1].replace(/\.| |-/g, "_")).remove(); // remove associated tooltip
			})
            .on("mouseover", function () {
				var tooltipText = (pointType == "askPrice" ? "<u>Customer Ask Price</u><br/>" : "<u>New Grid Point</u><br/>");
				tooltipText += (pointType == "askPrice" ? xName + ": " + format(newX) + "<br/>" : "Predicted " + xName + ": " + format(predX) + "<br/>");
				tooltipText += (pointType == "askPrice" ? yName + ": " + newY.toFixed(2) + "<br/>" : "");
				tooltipText += "Predicted " + yName + ": " + predY.toFixed(2) + "<br/>";
				tooltipText += (pointType == "askPrice" ? "Grid Deviation: " + gridDev.toFixed(2) : "");
				newPointTooltip.attr("id", "new_point_tooltip_" + newCoord[0].replace(/\.| |-/g, "_") + "_" + newCoord[1].replace(/\.| |-/g, "_")).transition().style("opacity", 0.62).style("display", "block");
				newPointTooltip.html(tooltipText)
					.style("left", (d3.event.pageX - 80) + "px")
					.style("top", (d3.event.pageY + 20) + "px");
			})
            .on("mouseout", function () {
				newPointTooltip.transition().style("opacity", 0).style("display", "none");
			});
		if (pointType == "askPrice") {
			newPoint.transition().duration(1000).ease("elastic").attr("transform", function (d) {return "translate(" + xScale(newX) + "," + yScale(newY) + ")";});
			newPoint.on("click", function (d) {
				rawDataObject.competitorCategory = newPointCategory;
				rawDataObject.competitorRevenue = newX;
				$(".externalObject").remove();
				var clickCoord = d3.mouse(this);
				var divText = "";
				divText += "<div id=competitor_price_div class=externalTextbox><b>Add Competitor Price for:</b><br/>";
				divText += newPointCategory + "<br/>";
				divText += "Revenue: " + format(newX) + "<br/>";
				divText += "<input type='text' id=competitor_name class=externalTextbox placeholder='enter competitor name'></input>";
				divText += "<input type='text' id=competitor_price class=externalTextbox placeholder='enter competitor price' onchange=addCompetitorPrice()></input></div>";
				
				d3.select("svg").append("foreignObject")
					.attr("class", "externalObject")
					.attr("x", (xScale(newX) - 10) + "px")
					.attr("y", (yScale(newY) - 60) + "px")
					.attr("width", 200)
					.attr("height", 200)
					.append("xhtml:div")
					.html(divText);
			})
		} else {
			newPoint.transition().duration(1000).ease("elastic").attr("transform", function (d) {return "translate(" + xScale(predX) + "," + yScale(predY) + ")";});
		}
        $("#new_point_div").hide();
    }
}

// Add new competitor price
function addCompetitorPrice () {
    var xScale = rawDataObject.xScale,
        yScale = rawDataObject.yScale,
		competitorCategory = rawDataObject.competitorCategory,
		competitorRevenue = rawDataObject.competitorRevenue,
		pointData = rawDataObject.pointData,
        minRangeY = rawDataObject.minRangeY,
        maxRangeY = rawDataObject.maxRangeY,
		format = d3.format(",f"),
		competitorName = $("#competitor_name").val(),
        competitorPrice = $("#competitor_price").val(),
		predY = 0,
		gridDev = 0;
	
	if (isNaN(competitorPrice)) {
        alert("Invalid input!");
    } else if (parseFloat(competitorPrice) < minRangeY || parseFloat(competitorPrice) > maxRangeY) {
        alert("Input out of bound!");
    } else {
		competitorPrice = parseFloat(competitorPrice);
		// Initialize tooltip for competitor price
		var competitorPriceTooltip = d3.select("#data_visualization").append("div").attr("class", "tooltip");
		// Calculate predicted y and grid deviation
		for (var i = 0; i < pointData.length; i++) {
			if (pointData[i]["category"] == competitorCategory) {
				predY = pointData[i]["intercept"] + pointData[i]["slope"] * log10(competitorRevenue);
				gridDev = (competitorPrice - predY) / predY;
			}
		}
		var newPoint = d3.select("g").append("g").attr("class", "newpoints").append("path")
			.attr("id", "comp_price_" + competitorRevenue.toString().replace(/\./g, "_") + "_" + competitorPrice.toString().replace(/\./g, "_"))
			.attr("class", "comp_price_dot")
			.attr("d", d3.svg.symbol().type("cross").size(100))
			.style("zIndex", 10)
            .style("fill", $("#legend_" + competitorCategory.replace(/'|;| /g, "") + " rect").attr("fill"))
            .style("stroke", "black")
            .style("stroke-width", "2px")
            .on("contextmenu", function () {
				d3.event.preventDefault(); // prevent right click menu from showing
				d3.select(this).remove(); // remove dot
				d3.select("#comp_price_text_" + competitorRevenue.toString().replace(/\./g, "_") + "_" + competitorPrice.toString().replace(/\./g, "_")).remove(); // remove text
				d3.select("#comp_price_tooltip_" + competitorRevenue.toString().replace(/\./g, "_") + "_" + competitorPrice.toString().replace(/\./g, "_")).remove(); // remove associated tooltip
			})
            .on("mouseover", function () {
				var tooltipText = "<u>Competitor Price</u><br/>";
				tooltipText += (competitorName == "" ? "" : "Competitor Name: " + competitorName + "<br/>");
				tooltipText += "Competitor Price: " + competitorPrice.toFixed(2) + "<br/>";
				tooltipText += "Predicted Competitor Price: " + predY.toFixed(2) + "<br/>";
				tooltipText += "Grid Deviation: " + gridDev.toFixed(2);
				competitorPriceTooltip.attr("id", "comp_price_tooltip_" + competitorRevenue.toString().replace(/\./g, "_") + "_" + competitorPrice.toString().replace(/\./g, "_")).transition().style("opacity", 0.62).style("display", "block");
				competitorPriceTooltip.html(tooltipText)
					.style("left", (d3.event.pageX - 80) + "px")
					.style("top", (d3.event.pageY + 20) + "px");
			})
            .on("mouseout", function () {
				competitorPriceTooltip.transition().style("opacity", 0).style("display", "none");
			});
		var textLabel = d3.select(".newpoints").append("text").text(competitorName)
			.attr("id", "comp_price_text_" + competitorRevenue.toString().replace(/\./g, "_") + "_" + competitorPrice.toString().replace(/\./g, "_"))
			.attr("fill", $("#legend_" + competitorCategory.replace(/'|;| /g, "") + " rect").attr("fill"))
			.style("font-size", "14px")
			.style("stroke", "black")
			.style("stroke-width", "0.5px");
		textLabel.transition().duration(1000).ease("elastic").attr("transform", function (d) {return "translate(" + (xScale(competitorRevenue) + 12) + "," + (yScale(competitorPrice) + 5) + ")";});
		newPoint.transition().duration(1000).ease("elastic").attr("transform", function (d) {return "translate(" + xScale(competitorRevenue) + "," + yScale(competitorPrice) + ")";});
		$("#competitor_price_div").hide();
	}
}












