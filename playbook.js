function changePBaxis(){
    var xMove = parseFloat($("#pb_new_y_axis").val().substr(0,2))/100;
    totXMove = xMove / 0.5;
    return totXMove;
}

function pbClickAll() {
    $(".pbDiv_click_tooltip").remove();
    $(".pb_circle").filter(function(){ return $(this).css("opacity") == 1;}).doClick()
}

function pbTooltipClick(d) {
    // Identify the ID of selected point
    var data = rawDataObject.currentData;
    var radius = $("#choose_z_pb").val();
    var pointID = "point_" + d3.select(this).attr("cx").replace(".", "_") + "_" + d3.select(this).attr("cy").replace(".", "_");
    var rScale = d3.scale.linear().domain([d3.min(data, function (d) { return d[radius]; }), d3.max(data, function (d) { return d[radius]; })]).range([5, 20]);

    var clickTooltip = d3.select("#pbDiv_click_tooltip")
        .append("div")
        .attr("id", pointID)
        .attr("class", "click_tooltip");
	$("#" + pointID).draggable();
    if (d3.select(this).style("stroke-opacity") == 0) { // if the clicked point is not selected
        var tooltipText = tooltipUpdate(d); // click select animation
        d3.select(this)
            .attr("r", 60)
            .style("stroke", "black")
            .style("stroke-width", "2px")
            .style("stroke-opacity", 1)
            .transition()
            .duration(600)
            .attr("r", function(d){ return rScale(d[radius]);});
        clickTooltip.transition().style("opacity", 0.62); // activate click tooltip
        clickTooltip.html(tooltipText)
            .style("left", ($(this).position()["left"] + 70) + "px")
            .style("top", ($(this).position()["top"] + 30) + "px");
    } else { // Deselect the clicked point
        d3.select(this)
            .transition()
            .attr("r", function(d){ return rScale(d[radius]);})
            .style("stroke-opacity", 0)
        d3.selectAll("#" + pointID).transition().style("opacity", 0).remove(); // remove all tooltip divs for the selected point
    }
}

//Populate the dropdown selection
function pbDropDown() {
	var data = rawDataObject.currentData,
		customerName = rawDataObject.customerName,
		uniqueCustomer = extractValue(data, customerName).filter(detectUnique);
	$("#catDropDown").empty();
	$("#catDropDown").append("<option value='defaultVal'>All Customers</option>");
    for (i = 0; i < uniqueCustomer.length; i++) {
        $("#catDropDown").append("<option>" + uniqueCustomer[i] + "</option>")
    };
	$("#catDropDown").show();
}

function createPbCategory(data) {
	var hideList = rawDataObject.pbHideList,
		customerName = rawDataObject.customerName;
		
    for (i = 0; i < data.length; i++) {
		var newCat = "";
        newCat += data[i][customerName] + "_";
        for (key in data[i]) {
            if ((key.toLowerCase().substring(0, 6) == "filter") & ($.inArray(key, hideList) == -1)) {
                newCat += data[i][key] + "_"
            }
        }
        data[i]["pbCategory"] = newCat.replace(/;|'| |,|\./g, "_");
    }
}

function pbTooltipMouseover(d) {
    $("#pbTooltip").remove();
	
    d3.selectAll(".pb_circle").style("opacity", "0.3");
    d3.selectAll(".pb_line").style("opacity", "0.3")
    d3.select(this).style("opacity", "1");
	
    var tooltip = d3.select("#playbook_viz").append("div").attr("id", "pbTooltip").attr("class", "tooltip"),
        tooltipText = tooltipUpdate(d);
    tooltip.transition().style("opacity", 0.9).style("display", "block");
    tooltip.html(tooltipText)
        .style("left", ($(this).position()["left"] + 15) + "px")
        .style("top", ($(this).position()["top"] - 30) + "px");
}

function pbTooltipMouseout(d) {
	d3.selectAll(".pb_circle").style("opacity", "1");
	d3.selectAll(".pb_line").style("opacity", "1");
    d3.select("#pbTooltip").transition().style("opacity", 0).style("display", "none");
}

function createLineData(data) {
	var xName = $("#choose_x_pb").val(),
		yName = $("#choose_y_pb").val(),
        colorName = "pbCategory";
    var colorUnique = extractValue(data, colorName).filter(detectUnique);
    var lineData = {}; // Creates an empty object
    for (var j = 0; j < colorUnique.length; j++) { //Starts to loop through unique values
        var key = colorUnique[j]; //Set Key and **RegEx Expression to remove spaces and semi-colons.
        lineData[key] = []; // New Array inside object
        for (var i = 0; i < data.length; i++) { //Loops through all records
            if (data[i][colorName] == colorUnique[j]) { //If Category = the unique category value then it will populate into the array
                lineData[key].push({
                    "x": parseFloat(data[i][xName]),
                    "y": parseFloat(data[i][yName])
                }); // populate into the array
            }
        }
    }
    return lineData;
}

function pbFilterCustomer() {
    createPlaybook();
    $(".clickTooltip").remove();
    $(".pbTooltip").remove();
    
    var filter = $("#catDropDown").val();
    var visibleData = [];
    if (filter == "defaultVal") {
        d3.selectAll(".pb_circle").style("display", "block");
        d3.selectAll(".pb_line").style("display", "block");
    } else {
        d3.selectAll(".pb_circle").each(function (d) {
            if (filter == this.id.split("_")[1]) {
                d3.select(this).style("display","block");
            } else {
                d3.select(this).style("display","none");
            }
        });
        d3.selectAll(".pb_line").each(function (d) {
            if (filter == this.id.split("_")[1]) {
                d3.select(this).style("display","block");
            } else {
                d3.select(this).style("display","none");
            }
        });
        d3.selectAll(".legendItem").each(function (d) {
            if (filter == this.id.split("_")[1]) {
                visibleData.push(this.id.substr(7));
            }
        });
        $(".legendValues").remove();
        addLegend(visibleData);
    }
}

function addLegend(data) {
    var pointData = rawDataObject.currentData;
    var colorName = "pbCategory";
    var colorUnique = extractValue(pointData, colorName).filter(detectUnique);
    var width = rawDataObject.width,
        clr = d3.scale.category10().domain(colorUnique);

    var legend = d3.select("#pb_svg").append("g").attr("class", "legendValues")
        .selectAll(".legend").data(data).enter()
        .append("g")
        .style("zIndex", 1) //specifies order
        .attr("id", function (d) {
            return "legend_" + d;
        })
        .attr("class", "legendItem")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";

        });
    legend.append("rect")
        .attr("x", width * 0.80 + 50)
        .attr("y", 30)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", clr);
    legend.append("text")
        .attr("x", width * 0.80 + 75)
        .attr("y", 42)
        .style("text-anchor", "start")
        .text(function (d) {
            return d.replace(/_/g, "; ");
        });

    legend.on("mouseover", function(){
            var key = d3.select(this).attr("id").substr(7);
            d3.select(this).style("stroke-width", 1.5).style("stroke", "black");
            d3.selectAll(".pb_line").style("opacity", "0.1");
            d3.selectAll(".pb_circle").style("opacity", "0.1");
            d3.selectAll("#circle_"+key).style("opacity","1");
            d3.selectAll("#gline_"+key).style("opacity","1");
        })
    legend.on("mouseout", function(){
            d3.select(this).style("stroke-width", 0);  
            d3.selectAll(".pb_line").style("opacity", "1");
            d3.selectAll(".pb_circle").style("opacity", "1");
        });
}

function createPlaybook() {
	$("#pb_svg").remove();
	$("#pbDiv_click_tooltip").remove();
    //Read data and store variables for later use
    var data = rawDataObject.currentData,
		xName = $("#choose_x_pb").val(),
		yName = $("#choose_y_pb").val(),
		radius = $("#choose_z_pb").val(),
        width = rawDataObject.width,
        height = rawDataObject.height,
		margin = rawDataObject.margin,
        colorName = "pbCategory",
        formatAsPercentage = d3.format("%")
        totXMove = changePBaxis();
	
	var colorUnique = extractValue(data, colorName).filter(detectUnique);

    //Setup Color
    var clr = d3.scale.category10().domain(colorUnique);
    var cValue = function (d) {
        return d[colorName];
    };

    //Convert data to numeric
    data.forEach(function (d) {
        d[xName] = +d[xName];
        d[yName] = +d[yName];
        d[radius] = +d[radius];
    });

    //Set up more variables, needed the variables to be numeric to calculate
    var yMin = d3.min(extractValue(data, yName)),
        yMax = d3.max(extractValue(data, yName)),
        y0 = Math.max(Math.abs(yMin), Math.abs(yMax));

    //Calcuate Scale
    var xScale = d3.scale.linear().domain([0, 1]).range([0, width * 0.8]),
		yScale = d3.scale.linear().domain([-y0, y0]).range([height, 0]),
		rScale = d3.scale.linear().domain([d3.min(data, function (d) { return d[radius]; }), d3.max(data, function (d) { return d[radius]; })]).range([5, 20]);

    //Linefunction for later use
    var lineFunction = d3.svg.line()
			.x(function (d) { return xScale(d.x);})
			.y(function (d) { return yScale(d.y);})
			.interpolate("linear");

	d3.select("#playbook_viz").append("div").attr("id", "pbDiv_click_tooltip");

    //Append SVG to DIV
    var svg = d3.select("#playbook_viz").append("svg")
				.attr("id", "pb_svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
                .append("g").attr("transform", "translate(30,30)");

    //Append rectangles
    var rectContainer = svg.append("g").attr("class", "backRect");
    var rectData = {
        "bottom-left": [{"x":0, "y":-y0}, {"x": totXMove * 0.5, "y": -y0}, {"x":totXMove*0.5, "y":0}, {"x":0,"y":0}],
        "bottom-right": [{"x":totXMove*0.5, "y":-y0}, {"x": 1, "y": -y0}, {"x": 1, "y":0}, {"x":totXMove*0.5,"y":0}],
        "top-right": [{"x":totXMove*0.5, "y":0}, {"x": 1, "y": 0}, {"x":1, "y":y0}, {"x":totXMove*0.5,"y":y0}],
        "top-left": [{"x":0, "y":0}, {"x": totXMove*0.5, "y": 0}, {"x":totXMove*0.5, "y":y0}, {"x":0,"y":y0}]
    };
    var rectColors = {"bottom-left":"lightcoral", "bottom-right":"gold", "top-right":"seagreen", "top-left":"lightblue"};
	
    for (key in rectData) {
        rectContainer.append("path")
        .attr("d", lineFunction(rectData[key]))
        .attr("fill", rectColors[key])
        .style("opacity", 0.1);
    }
	
    //Draw Axis
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(formatAsPercentage);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height / 2) + ")")
        .call(xAxis)
		.style("pointer-events", "none");

    svg.append("text")
        .attr("class", "xlabel")
        .attr("x", width * 0.8 + 20)
        .attr("y", height / 2 + 5)
        .style("text-anchor", "middle")
		.style("font-weight", "bold")
        .text(xName);

    var yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(formatAsPercentage);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (totXMove * (width * 0.8) / 2) + ",0)")
        .call(yAxis)
		.style("pointer-events", "none");

    svg.append("text")
        .attr("class", "ylabel")
        .attr("x", totXMove * (width * 0.8) / 2)
        .attr("y", -10)
        .style("text-anchor", "middle")
		.style("font-weight", "bold")
        .text(yName);

    //Draw Line Data
    var lineData = createLineData(data),
		lineCol = d3.scale.category10().domain(Object.keys(lineData)),
		lineContainer = svg.append("g").attr("class", "playbook_lines");
    for (var key in lineData) {
		var lines = lineContainer.append("path")
            .attr("d", lineFunction(lineData[key]))
            .attr("id", function (d) {
                return "gline_" + key;
            })
            .attr("class", "pb_line")
            .attr("stroke", "white")
            .attr("stroke-width", 0.1)
            .attr("fill", "none");
		
		lines.transition().duration(1200)
			.attr("stroke", lineCol(key))
			.attr("stroke-width", 5);
    }

    //Draw Circles
    var circles = svg.append("g").attr("class", "playbook_dots")
					.selectAll("circles").data(data).enter()
					.append("circle")
					.attr("id", function (d) {
						return "circle_" + d[colorName].replace(/'|;| /g, "_");
					})
					.attr("class", "pb_circle")
					.attr("cx", 0)
					.attr("cy", 0)
					.attr("r", function (d) {
						return rScale(d[radius]);
					})
					.style("fill", function (d) {
						return clr(cValue(d)); //scales the unique values
					})
                    .style("stroke-opacity", 0)
                    .on("click", pbTooltipClick)
					.on("mouseover", pbTooltipMouseover)
					.on("mouseout", pbTooltipMouseout);

    circles.transition().duration(1000)
        .attr("cx", function (d) {
            return xScale(d[xName]);
        })
        .attr("cy", function (d) {
            return yScale(d[yName]);
        });
	addLegend(colorUnique);

    //Interaction Section 
    d3.selectAll(".pb_line")
        .on("mouseover", function () {
            var key = d3.select(this).attr("id").substr(6);
            d3.selectAll(".pb_line").style("opacity", "0.3");
			d3.selectAll(".pb_circle").style("opacity", "0.3");
            d3.select(this).style("opacity", "1");
			
			d3.selectAll(".pb_circle").each(function(d) {
				if (key == this.id.substr(7)) {
					d3.select(this).style("opacity", "1");
					var tooltip = d3.select("#playbook_viz").append("div").attr("id", "pb_line_circle_tooltip").attr("class", "tooltip");
					tooltipText = tooltipUpdate(d);
					tooltip.transition().style("opacity", 0.9).style("display", "block");
					tooltip.html(tooltipText)
						.style("left", ($(this).position()["left"] + 15) + "px")
						.style("top", ($(this).position()["top"] - 30) + "px");
				}
			});
        })
        .on("mouseout", function () {
            d3.selectAll(".pb_line").style("opacity", "1");
            d3.selectAll(".pb_circle").style("opacity", "1");
			d3.selectAll("#pb_line_circle_tooltip").remove();
        });
}

function initPlaybook() {
	var data = rawDataObject.currentData,
		pbXList = rawDataObject.pbXList,
		pbYList = rawDataObject.pbYList,
		pbZList = rawDataObject.pbZList;

    $("#choose_variables").hide();
	$("#grid_svg").hide();
	$("#choose_x_pb").empty();
	$("#choose_y_pb").empty();
	$("#choose_z_pb").empty();
    d3.selectAll(".pbTooltip").remove(); // remove mouseover tooltip, anchor point & minimum price point tooltip
    d3.selectAll(".click_tooltip").remove(); // remove click tooltip

	for (var i = 0; i < pbXList.length; i++) {
		$("#choose_x_pb").append("<option value='" + pbXList[i] + "'>x: " + pbXList[i] + "</option>");
	}
	for (var i = 0; i < pbYList.length; i++) {
		$("#choose_y_pb").append("<option value='" + pbYList[i] + "'>y: " + pbYList[i] + "</option>");
	}
	for (var i = 0; i < pbZList.length; i++) {
		$("#choose_z_pb").append("<option value='" + pbZList[i] + "'>size: " + pbZList[i] + "</option>");
	}
    $("#playbook_choose_variables").show();

    $("#pb_new_y_axis").mask("00%");
	
	pbDropDown();
	createPbCategory(data);
	createPlaybook();
}
