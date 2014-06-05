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
	rawDataObject.askPriceCategory = d;
	var divText = "";
    divText += "<div id=new_ask_price class=externalTextbox><b>Add Asking Price for:</b><br/>";
	divText += d + "<br/>";
    divText += "<input type='text' id=ask_price_coord class=externalTextbox placeholder='enter coordinates' onchange=updateAskPrice()></input></div>";
	
    d3.select("svg").append("foreignObject")
        .attr("class", "externalObject")
        .attr("x", ($(".legend rect").attr("x") * 0.68) + "px")
        .attr("y", "50px")
        .attr("width", 200)
        .attr("height", 100)
        .append("xhtml:div")
        .html(divText);
}

// Add actual ask price point
function updateAskPrice() {
    var xScale = rawDataObject.xScale,
        yScale = rawDataObject.yScale,
		askPriceCategory = rawDataObject.askPriceCategory,
		pointData = rawDataObject.pointData,
        settings = rawDataObject.settings,
        xMin = settings.xMin,
        xMax = settings.xMax,
        yMin = settings.yMin,
        yMax = settings.yMax,
		xName = settings.xName,
        yName = settings.yName,
		format = d3.format(",f"),
        newCoord = $("#ask_price_coord").val().split(","),
        newAskX = parseFloat(newCoord[0]),
        newAskY = parseFloat(newCoord[1]),
		predY = 0,
		gridDev = 0;
    if (isNaN(newAskX) || isNaN(newAskY)) {
        alert("Invalid input!");
    } else if (newAskX < Math.pow(10, Math.floor(log10(xMin))) || newAskX > Math.pow(10, Math.ceil(log10(xMax))) || newAskY < 0.9 * yMin || newAskY > 1.1 * yMax) {
        alert("Input out of bound!");
    } else {
		var askPriceTooltip = d3.select("#data_visualization").append("div").attr("class", "tooltip"); // add tooltip for new asking price
		
		for (var i = 0; i < pointData.length; i++) {
			if (pointData[i]["category"] == askPriceCategory) {
				predY = pointData[i]["intercept"] + pointData[i]["slope"] * log10(newAskX);
				gridDev = (newAskY - predY) / predY;
			}
		}

        var askPricePoint = d3.select("g").append("rect")
            .attr("id", "ask_point_" + newAskX + "_" + newAskY)
            .attr("class", "ask_dot")
            .attr("width", 12)
            .attr("height", 12)
            .attr("x", 0)
            .attr("y", 0)
            .style("zIndex", 10)
            .on("contextmenu", function () {
				d3.event.preventDefault(); // prevent right click menu from showing
				d3.select(this).remove(); // remove dot
				d3.select("#ask_tooltip_" + newAskX + "_" + newAskY).remove(); // remove associated tooltip
			})
            .on("mouseover", function () {
				var tooltipText = "<u>New Ask Price</u><br/>" + xName + ": " + format(newAskX) + "<br/>" + yName + ": " + newAskY.toFixed(2) + "<br/>";
				tooltipText += "Predicted " + yName + ": " + predY.toFixed(2) + "<br/>" + "Grid Deviation: " + gridDev.toFixed(2);
				askPriceTooltip.attr("id", "ask_tooltip_" + newAskX + "_" + newAskY).transition().style("opacity", 0.62).style("display", "block");
				askPriceTooltip.html(tooltipText)
					.style("left", (d3.event.pageX - 80) + "px")
					.style("top", (d3.event.pageY + 20) + "px");
			})
            .on("mouseout", function () {
				askPriceTooltip.transition().style("opacity", 0).style("display", "none");
			});
        askPricePoint.transition().duration(1000).ease("elastic")
            .attr("x", xScale(newAskX))
            .attr("y", yScale(newAskY))
            .style("fill", $("#legend_" + askPriceCategory.split("; ").join("_").split("'").join("") + " rect").attr("fill"))
            .style("stroke", "black")
            .style("stroke-width", "2px");
        $("#new_ask_price").hide();
    }
}


