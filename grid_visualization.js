// Calculate grid line
function findLine(slope, x1, x2, y2, xMax) {
    var intercept = y2 - slope * x2,
        y1 = slope * x1 + intercept,
        yMax = intercept + xMax * slope,
        output = {};
    output["x1"] = x1;
    output["y1"] = y1;
    output["x2"] = x2;
    output["y2"] = y2;
    output["slope"] = slope;
    output["intercept"] = intercept;
    output["y2Max"] = yMax;
    return output;
}

// Check availability of File API
$(document).ready(function () {
    if (isAPIAvailable()) {
        $("#files").bind("change", handleFileSelect);
    }
});

function isAPIAvailable() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        return true;
    } else {
        document.writeln("The HTML5 APIs used in this page are only available in the following browsers:<br/>");
        document.writeln(" - Google Chrome: 13.0 or later<br/>");
        document.writeln(" - Mozilla Firefox: 6.0 or later<br/>");
        document.writeln(" - Internet Explorer: Not supported (partial support expected in 10.0)<br/>");
        document.writeln(" - Safari: Not supported<br/>");
        document.writeln(" - Opera: Not supported");
        return false;
    }
}

// File select handler
function handleFileSelect(evt) {
    var files = evt.target.files;
    var file = files[0];
    var output = "<font color='blue'>Data Loaded!</font>";
/*
    output += " - FileName: " + escape(file.name) + "<br/>";
    output += " - FileType: " + (file.type || "n/a") + "<br/>";
    output += " - FileSize: " + file.size + " bytes<br/>";
    output += " - LastModified: " + (file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : "n/a") + "<br/>";
*/
    readData(file);

    $("#upload_status").html(output);
	$("#upload_status").show();
	setTimeout(function () { $("#upload_status").fadeOut("slow"); }, 800);
    d3.select("svg").remove();
	d3.select("#div_click_tooltip").remove();
}

// Read and parse data from csv
function readData(file) {
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function (event) {
        var csv = event.target.result;
        rawDataObject.dataObject = $.csv.toObjects(csv);
		defineBu(rawDataObject.buName);
    };
    reader.onerror = function () {
        alert("Unable to read " + file.fileName);
    };
}

// Populate drop down menu for business unit
function defineBu(name) {
    $("#choose_bu").empty();
    $("#choose_bu").append("<option value=''>choose a business unit</option>");
    var buList = extractValue(rawDataObject.dataObject, name).filter(detectUnique);
    for (var i = 0; i < buList.length; i++) {
		$("#choose_bu").append("<option value='" + buList[i] + "'>Business Unit: " + buList[i] + "</option>");
    }
    $("#choose_bu").show();
}

// Populate filters and axes selector
function popControl() {
    d3.select("svg").remove();
	d3.select("#div_click_tooltip").remove();
	
	var data = rawDataObject.dataObject.slice(),
		buName = rawDataObject.buName;
	
	for (var i = data.length - 1; i >= 0; i--) {
		if (data[i][buName] != $("#choose_bu").val()) {
			data.splice(i, 1);
		}
	}
	rawDataObject.buData = data;
	
	defineX(Object.keys(data[0]));
	defineY(Object.keys(data[0]));
	defineTooltip(Object.keys(data[0]));
	createCheckBox(data);
	$("#visualization_tabs").show();
	$("#visualization_tabs").tabs({ selected: 1 });
	
    $("#choose_x").val("Customer revenue");
	$("#choose_y").val("Absolute Px");
//    $("#choose_y").val("GB Px");
    $(".checkbox")[0].checked = true;
    $(".checkbox")[1].checked = true;
    $(".checkbox")[2].checked = true;
	$(".checkbox")[5].checked = true;
    $(".checkbox")[6].checked = true;
    $(".tooltip_display")[7].checked = true;
//    $(".tooltip_display")[9].checked = true;
    $(".tooltip_display")[10].checked = true;
}

// Define x-axis variable
function defineX(dataHeader) {
    $("#choose_x").empty();
    $("#choose_x").append("<option value=''>choose variable x</option>");
    var p = dataHeader.length;
    for (var i = 0; i < p; i++) {
        if ($.inArray(dataHeader[i].toLowerCase().substring(0, 6), rawDataObject.hideList) == -1) {
            var varOption = document.createElement("option");
            varOption.text = "x: " + dataHeader[i];
            varOption.value = dataHeader[i];
            document.getElementById("choose_x").options.add(varOption);
        }
    }
    $("#choose_x").show();
}

// Define y-axis variable
function defineY(dataHeader) {
    $("#choose_y").empty();
    $("#choose_y").append("<option value=''>choose variable y</option>");
    var p = dataHeader.length;
    for (var i = 0; i < p; i++) {
        if ($.inArray(dataHeader[i].toLowerCase().substring(0, 6), rawDataObject.hideList) == -1) {
            var varOption = document.createElement("option");
            varOption.text = "y: " + dataHeader[i];
            varOption.value = dataHeader[i];
            document.getElementById("choose_y").options.add(varOption);
        }
    }
    $("#choose_y").show();
}

// Define tooltip display variable
function defineTooltip(dataHeader) {
    $(".tooltip_label").remove();
    $("#tooltip_title").show();
    for (var i = 0; i < dataHeader.length; i++) {
//        if ($.inArray(dataHeader[i].toLowerCase().substring(0, 6), rawDataObject.hideList) == -1) {
            var tooltipLabel = $("<label class=tooltip_label />").html(dataHeader[i])
                .prepend($("<input/>")
                    .attr({
                        type: "checkbox",
                        id: "tooltip_" + dataHeader[i],
                        class: "tooltip_display",
                        value: dataHeader[i]
                    }));
            $("#tooltip_checkbox").append(tooltipLabel).append("<br class=tooltip_label />");
//        }
    }
    $("#selectall_label").show();
}

// Enable select all feature for tooltips
function tooltipSelectAll(source) {
    var tooltipCheckbox = $(".tooltip_display");
    for (var i = 0; i < tooltipCheckbox.length; i++) {
        tooltipCheckbox[i].checked = source.checked;
    }
}

// Detect filters from data
function defineFilters(dataHeader) {
    var p = dataHeader.length,
        filters = [];
    for (var i = 0; i < p; i++) {
        if (dataHeader[i].toLowerCase().substring(0, 6) == "filter") {
            filters.push(dataHeader[i]);
        }
    }
    return filters;
}

// Enable select all feature for filters
function filterSelectAll(filterName, source) {
	var filterCheckbox = $("[id='" + filterName + "']");
    for (var i = 0; i < filterCheckbox.length; i++) {
        filterCheckbox[i].checked = source.checked;
    }
}

// Add filters and create check boxes for each
function createCheckBox(data) {
    $("#filter_checkbox").empty();
    var dataHeader = Object.keys(data[0]),
        filterName = defineFilters(dataHeader);

    for (var i = 0; i < filterName.length; i++) {
        $("#filter_checkbox").append("<br/>");
        $("#filter_checkbox").append("<div class=" + filterName[i].replace(/,|\.|-| /g, "") + "><b>" + filterName[i] + "</b></div>");
        // Extract unique data for each filter
		var uniqueFilterData = extractValue(data, filterName[i]).filter(detectUnique),
			filterId = filterName[i].replace(/,|\.|-| /g, "")

        // Sort each filter options
        if (isNaN(parseFloat(uniqueFilterData[0]))) {
            uniqueFilterData.sort();
        } else {
            uniqueFilterData.sort(sortNumber);
        }

        // Create check boxes according to unique filter data
		var selectAllCb = "<label><input type='checkbox' id=" + filterId + "_selectall onchange='filterSelectAll(&apos;" + filterName[i] + "&apos;, this)'><font color='#5C5858'><em>Select / Deselect all</em></font></label>"
		$("#filter_checkbox").append(selectAllCb).append("<br/>");
        for (var k = 0; k < uniqueFilterData.length; k++) {
            var checkBoxLabel = $("<label/>").html(uniqueFilterData[k])
                .prepend($("<input/>")
                    .attr({
                        type: "checkbox",
                        id: filterName[i],
                        class: "checkbox",
                        value: uniqueFilterData[k]
                    }));
            $("#filter_checkbox").append(checkBoxLabel).append("<br/>");
        }
    }
}

// Subset data for visualization
function subsetData(input_data) {
    // Detect the names of unchecked filters
    var uncheckedFilterObject = {},
        uncheckedFilterValue = [];
    for (var i = 0; i < $(".checkbox").length; i++) {
        if ($(".checkbox")[i].checked == false) {
            if (!($(".checkbox")[i].id in uncheckedFilterObject)) {
                uncheckedFilterObject[$(".checkbox")[i].id] = [];
                uncheckedFilterObject[$(".checkbox")[i].id].push($(".checkbox")[i].value);
            } else {
                uncheckedFilterObject[$(".checkbox")[i].id].push($(".checkbox")[i].value);
            }
        }
    }

    // Remove unchecked variables from data
    var data = input_data.slice(),
        keyCount = 0;
    for (var i = data.length - 1; i >= 0; i--) {
        keyCount = 0;
        for (var filterKey in uncheckedFilterObject) {
            if ($.inArray(data[i][filterKey], uncheckedFilterObject[filterKey]) > -1) {
                keyCount += 1;
            } else {
                continue;
            }
        }
        if (keyCount > 0) {
            data.splice(i, 1);
        }
    }

    // Group filters and create new column as category
    for (var i = 0; i < data.length; i++) {
        data[i]["Category"] = "";
        for (filterKey in data[i]) {
            if (filterKey.toLowerCase().substring(0, 6) == "filter") {
                data[i]["Category"] = data[i]["Category"] + data[i][filterKey] + "; ";
            }
        }
    }
    return data;
}

// Data visualization window
function scatterPlot(data) {
    // Initialize settings
    var margin = rawDataObject.margin,
        width = rawDataObject.width,
        height = rawDataObject.height,
        minPriceX = rawDataObject.minPriceX,
		customerName = rawDataObject.customerName,
		minRangeX = rawDataObject.minRangeX,
		maxRangeX = rawDataObject.maxRangeX,
		settings = rawDataObject.settings,
        xName = settings.xName,
        yName = settings.yName,
        zName = settings.zName,
        yMin = settings.yMin,
        yMax = settings.yMax;

	var xRange = [],
		minRage = minRangeX;
	while (minRage <= maxRangeX) {
		xRange.push(minRage);
		minRage *= 10;
	}
	
    // set up x
    var xValue = function (d) {
            return d[xName];
        },
        xScale = d3.scale.log()
        .domain([minRangeX, maxRangeX])
        .range([0, width])
        .nice(),
        xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickValues(xRange)
        .tickFormat(d3.format(","));
    // set up y
    var yValue = function (d) {
            return d[yName];
        },
        yScale = d3.scale.linear()
        .domain([yMin - yMin * 0.1, yMax + yMax * 0.15])
        .range([height, 0])
        .nice(),
        yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");
	// Record minimum and maximum range of y and pass to global
	rawDataObject.minRangeY = yScale.invert(height);
	rawDataObject.maxRangeY = yScale.invert(0);

    // set up fill color
    var zValue = function (d) {
            return d[zName];
        },
        zColor = d3.scale.category10();
    // Pass scales to global
    rawDataObject.xScale = xScale;
    rawDataObject.yScale = yScale;

    // Append click tooltip div for multiple selections
    d3.select("#data_visualization").append("div").attr("id", "div_click_tooltip");

    // attach svg to canvas
    var svgContainer = d3.select("#data_visualization").append("svg")
        .attr("width", $("#data_visualization").width() - 20)
        .attr("height", height + margin.top + margin.bottom);
	
	var svg = svgContainer.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").style("pointer-events", "all");

    // x-axis
    svg.append("g")
		.attr("id", "xaxis")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
		.style("pointer-events", "none")
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", 40)
        .style("text-anchor", "end")
        .style("font-weight", "bold")
        .text(xName);

    // y-axis
    svg.append("g")
		.attr("id", "yaxis")
        .attr("class", "axis")
        .call(yAxis)
		.style("pointer-events", "none")
        .append("text")
        .attr("class", "label")
        .attr("x", margin.left / 2)
        .attr("y", -20)
        .style("text-anchor", "end")
        .style("font-weight", "bold")
        .text(yName);
	
	// Add cross hair
	var crossHair = svg.append("g").attr("class", "crosshair");
	crossHair.append("line").attr("id", "h_crosshair") // horizontal cross hair
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", 0)
		.attr("y2", 0)
		.style("stroke", "gray")
		.style("stroke-width", "0.62px")
		.style("stroke-dasharray", "5,5")
		.style("display", "none");
		
	crossHair.append("line").attr("id", "v_crosshair") // vertical cross hair
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", 0)
		.attr("y2", 0)
		.style("stroke", "gray")
		.style("stroke-width", "0.62px")
		.style("stroke-dasharray", "5,5")
		.style("display", "none");
		
	crossHair.append("text").attr("id", "crosshair_text") // text label for cross hair
		.style("font-size", "10px")
		.style("stroke", "gray")
		.style("stroke-width", "0.62px");
	
	svg.on("mousemove", function () {
		var xCoord = d3.mouse(this)[0],
			yCoord = d3.mouse(this)[1];
			addCrossHair(xCoord, yCoord);
		})
		.on("mouseover", function () {d3.selectAll(".crosshair").style("display", "block");})
		.on("mouseout", function () {d3.selectAll(".crosshair").style("display", "none");})
		.append("rect")
		.style("visibility", "hidden")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width)
		.attr("height", height);
	
    // scatter plot
    svg.append("g").attr("class", "scatterplot").selectAll("scatterplot")
        .data(data).enter().append("circle")
		.attr("id", function (d) {
			return ("dot_" + d[customerName]);
		})
        .attr("class", "dot")
        .attr("r", 4.5)
        .attr("cx", function (d) {
            return xScale(xValue(d));
        })
        .attr("cy", function (d) {
            return yScale(yValue(d));
        })
		.style("zIndex", 7)
        .style("fill", function (d) {
            return zColor(zValue(d));
        })
        .on("click", tooltipClick)
        .on("mouseover", tooltipMouseover)
        .on("mouseout", tooltipMouseout);

    // legend
    var legend = svg.selectAll(".legend")
        .data(zColor.domain())
        .enter().append("g")
        .style("zIndex", 1)
		.attr("id", function (d) {
			var idSuffix = d.replace(/'|;| /g, "");
			return "legend_" + idSuffix;
		})
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 21 + ")";
        });
    legend.append("rect")
        .attr("x", width * 0.75)
        .attr("y", -12)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", zColor);
    legend.append("text")
        .attr("x", width * 0.75 + 25)
        .attr("y", 0)
        .style("text-anchor", "start")
        .text(function (d) {
            return d;
        });
	legend.on("click", addAskPrice);
	legend.on("mouseover", function () {d3.select(this).style("stroke-width", 1.5).style("stroke", "black").style("kerning", 1);})
	legend.on("mouseout", function () {d3.select(this).style("stroke-width", 0).style("kerning", 0);});
}

// Add grid lines
function addLine(data) {
    // Initialize settings
    var anchorName = rawDataObject.anchorName,
		capacityName = rawDataObject.capacityName,
        dSlopeName = rawDataObject.dSlopeName,
        minPriceX = rawDataObject.minPriceX,
        xScale = rawDataObject.xScale,
        yScale = rawDataObject.yScale,
		minRangeX = rawDataObject.minRangeX,
		maxRangeX = rawDataObject.maxRangeX,
		uniqueCat = rawDataObject.uniqueCat,
        settings = rawDataObject.settings,
        xName = settings.xName,
        yName = settings.yName,
        zName = settings.zName,
		zColor = d3.scale.category10().domain(uniqueCat),
		lineVals = [];
    // Determine unique category
    for (var i = 0; i < data.length; i++) {
        if ($.inArray(data[i][zName], extractValue(lineVals, "category")) == -1) {
            var objValue = {
                "category": data[i][zName],
				"capacity": parseFloat(data[i][capacityName]),
                "dSlope": parseFloat(data[i][dSlopeName]),
                "anchorX": parseFloat(data[i][anchorName.x]),
                "anchorY": 0,
                "anchorYpx": parseFloat(data[i][anchorName.y]),
                "anchorYperGB": parseFloat(data[i]["AnchorPerGB"]),
                "intercept": 0
            };
            lineVals.push(objValue);
        }
    }

	// Initialize line group
	d3.select("g").append("g").attr("class", "gridlines");

    // Plot through for loop
    var pointData = [];
    for (var i = 0; i < lineVals.length; i++) {
        if (yName == rawDataObject.pxGB) {
            lineVals[i].anchorY = lineVals[i].anchorYperGB;
        } else {
            lineVals[i].anchorY = lineVals[i].anchorYpx;
        }
        // Calculate coordinates, slope and intercept
        var coord = findLine(lineVals[i].dSlope * lineVals[i].anchorY, log10(minPriceX), log10(lineVals[i].anchorX), lineVals[i].anchorY, log10(maxRangeX * 0.5));
        lineVals[i].intercept = coord.intercept;
        coord["fillName"] = "group_" + i;
        coord["category"] = lineVals[i]["category"];
        pointData.push(coord);

        // Append grid line
        d3.select(".gridlines")
            .append("svg:line")
            .attr("id", "line_" + i)
            .attr("class", "grid_line")
            .attr("x1", xScale(Math.pow(10, coord.x1)))
            .attr("y1", yScale(coord.y1))
            .attr("x2", xScale(maxRangeX * 0.5))
            .attr("y2", yScale(coord.y2Max))
            .style("stroke", zColor(coord.category))
            .style("stroke-width", 6)
            .style("opacity", 0.62)
            .on("click", function (d) {
				d3.selectAll(".grid_line").style("opacity", 0.1);
				d3.selectAll(".hline").style("opacity", 0.1);
				d3.select(this).style("opacity", 1);
                $(".externalObject").remove();
                var divText = "";
                divText += "<div id=new_slope_text class=externalTextbox><b>Current Discount Slope: " + (coord.slope / coord.y2).toFixed(2) + "</b></div>";
                divText += "<input type='text' id=new_slope class=externalTextbox placeholder='enter new discount slope' onchange=updateLine()></input>";
                d3.select("svg").append("foreignObject")
                    .attr("class", "externalObject")
                    .attr("x", (d3.mouse(this)[0] - 20) + "px")
                    .attr("y", (d3.mouse(this)[1] - 10) + "px")
                    .attr("width", 200)
                    .attr("height", 100)
                    .append("xhtml:div")
                    .html(divText);
            });
    }
    rawDataObject.pointData = pointData;
}

// Add anchor points
function addAnchorPoints() {
    // Initialize settings
    var pointData = rawDataObject.pointData,
        xScale = rawDataObject.xScale,
        yScale = rawDataObject.yScale,
		uniqueCat = rawDataObject.uniqueCat,
        settings = rawDataObject.settings,
        xName = settings.xName,
        yName = settings.yName,
        zName = settings.zName,
        zColor = d3.scale.category10().domain(uniqueCat),
        format = d3.format(",f"),
        anchorTooltip = d3.select("#data_visualization").append("div").attr("id", "anchor_tooltip").attr("class", "tooltip"); // add tooltip for anchor points

    // Append anchor points
    d3.select("g").append("g").attr("class", "anchorpoints").selectAll("anchorpoints")
        .data(pointData).enter().append("circle")
        .attr("id", function (d) {
            return ("anchor_" + d["fillName"]);
        })
        .attr("class", "anchor_point")
        .attr("r", 6)
        .attr("cx", function (d) {
            return xScale(Math.pow(10, d["x2"]));
        })
        .attr("cy", function (d) {
            return yScale(d["y2"]);
        })
		.style("zIndex", 9)
        .style("fill", function (d) {
            return zColor(d["category"]);
        })
        .style("stroke", "black")
        .style("stroke-width", "2px")
        .style("stroke-opacity", 0.38)
        .style("opacity", 0.38)
        .on("mouseover", function (d) {
            var tooltipText = "<u>Anchor Point</u><br/>" + xName + ": " + format(Math.pow(10, d["x2"])) + "<br/>" + yName + ": " + d["y2"].toFixed(2);
            anchorTooltip.transition().style("opacity", 0.9).style("display", "block");
            anchorTooltip.html(tooltipText)
                .style("left", ($(this).position()["left"] - 62) + "px")
                .style("top", ($(this).position()["top"] + 25) + "px");
        })
        .on("mouseout", function (d) {
            anchorTooltip.transition().style("opacity", 0).style("display", "none");
        })
        .on("click", function (d) {
            d3.select(this).transition().style("stroke-opacity", 1).style("opacity", 1);
            $(".externalObject").remove();
            var divText = "";
            divText += "<div id=new_anchor_text class=externalTextbox><b>Current Coordinates:<br/>";
            divText += "(" + format(Math.pow(10, d["x2"])) + ", " + d["y2"].toFixed(2) + ")</b></div>";
            divText += "<input type='text' id=new_anchor class=externalTextbox placeholder='enter new coordinates' onchange=updateAnchor()></input>";
            rawDataObject.selectedAnchorId = d3.select(this).attr("id");
            d3.select("svg").append("foreignObject")
                .attr("class", "externalObject")
                .attr("x", (d3.mouse(this)[0] - 20) + "px")
                .attr("y", (d3.mouse(this)[1] - 15) + "px")
                .attr("width", 200)
                .attr("height", 100)
                .append("xhtml:div")
                .html(divText);
        });
}

// Add minimum price points
function addMinPricePoint() {
    // Initialize settings
    var pointData = rawDataObject.pointData,
        xScale = rawDataObject.xScale,
        yScale = rawDataObject.yScale,
		uniqueCat = rawDataObject.uniqueCat,
        settings = rawDataObject.settings,
        xName = settings.xName,
        yName = settings.yName,
        zName = settings.zName,
        zColor = d3.scale.category10().domain(uniqueCat),
        format = d3.format(",f"),
        minPriceTooltip = d3.select("#data_visualization").append("div").attr("id", "min_price_tooltip").attr("class", "tooltip"); // add tooltip for minimum price points

    // Append minimum price points
    d3.select("g").append("g").attr("class", "minpricepoints").selectAll("minpricepoints")
        .data(pointData).enter().append("circle")
        .attr("id", function (d) {
            return ("minx_" + d["fillName"]);
        })
        .attr("class", "min_price_point")
        .attr("r", 6)
        .attr("cx", function (d) {
            return xScale(Math.pow(10, d["x1"]));
        })
        .attr("cy", function (d) {
            return yScale(d["y1"]);
        })
		.style("zIndex", 8)
        .style("fill", function (d) {
            return zColor(d["category"]);
        })
        .style("stroke", "black")
        .style("stroke-width", "2px")
        .style("stroke-opacity", 0.38)
        .style("opacity", 0.38)
        .on("mouseover", function (d) {
            var tooltipText = "<u>Minimum Price Point</u><br/>" + xName + ": " + format(rawDataObject.minPriceX) + "<br/>" + yName + ": " + d["y1"].toFixed(2);
            minPriceTooltip.transition().style("opacity", 0.9).style("display", "block");
            minPriceTooltip.html(tooltipText)
                .style("left", ($(this).position()["left"] - 62) + "px")
                .style("top", ($(this).position()["top"] + 25) + "px");
        })
        .on("mouseout", function (d) {
            minPriceTooltip.transition().style("opacity", 0).style("display", "none");
        })
        .on("click", function (d) {
            d3.select(this).transition().style("stroke-opacity", 1).style("opacity", 1);
            $(".externalObject").remove();
            var divText = "";
            divText += "<div id=new_minx_text class=externalTextbox><b>Current Minimum Price:<br/>";
            divText += format(rawDataObject.minPriceX) + "</b></div>";
            divText += "<input type='text' id=new_minx class=externalTextbox placeholder='enter new minimum price' onchange=updateMinX()></input>";
            d3.select("svg").append("foreignObject")
                .attr("class", "externalObject")
                .attr("x", (d3.mouse(this)[0] - 20) + "px")
                .attr("y", (d3.mouse(this)[1] - 15) + "px")
                .attr("width", 200)
                .attr("height", 100)
                .append("xhtml:div")
                .html(divText);
        });

    // Append horizontal lines
	d3.select("g").append("g").attr("class", "horizontallines");
    for (var i = 0; i < pointData.length; i++) {
        d3.select(".horizontallines").append("svg:line")
            .attr("id", "hline_" + i)
            .attr("class", "hline")
            .attr("x1", 0)
            .attr("y1", yScale(pointData[i]["y1"]))
            .attr("x2", xScale(Math.pow(10, pointData[i]["x1"])))
            .attr("y2", yScale(pointData[i]["y1"]))
			.style("zIndex", 4)
            .style("stroke", zColor(pointData[i].category))
            .style("stroke-width", 6)
            .style("opacity", 0.62);
    }
}

// Grid line interactivity
function updateLine() {
    // Initialize settings
    var data = rawDataObject.currentData,
        pointData = rawDataObject.pointData,
        updateField = rawDataObject.updateField,
        dSlopeName = rawDataObject.dSlopeName,
        capacity = rawDataObject.capacityName,
        xScale = rawDataObject.xScale,
        yScale = rawDataObject.yScale,
		minRangeX = rawDataObject.minRangeX,
		maxRangeX = rawDataObject.maxRangeX,
        settings = rawDataObject.settings,
        minPriceX = rawDataObject.minPriceX,
        xName = settings.xName,
        yName = settings.yName,
        newSlope = 0,
        tempData = data.slice();
    // Retrieve user input for new discount slope
	if (typeof($("#new_slope").val()) == "undefined") {
        newSlope = data[0][dSlopeName];
    } else {
        newSlope = parseFloat($("#new_slope").val());
    }
    // Update kinked lines and minimum price point
    for (var i = 0; i < pointData.length; i++) {
        var coord = findLine(newSlope * pointData[i]["y2"], log10(minPriceX), pointData[i]["x2"], pointData[i]["y2"], log10(maxRangeX * 0.5));
        var newY1 = coord.intercept + coord.slope * coord.x1;
        pointData[i]["y1"] = newY1;
        pointData[i]["intercept"] = coord.intercept;
        pointData[i]["slope"] = coord.slope;
        // Update grid lines
        d3.select("#line_" + i).transition()
            .attr("x1", xScale(minPriceX))
            .attr("y1", yScale(newY1))
            .attr("x2", xScale(maxRangeX * 0.5))
            .attr("y2", yScale(coord.y2Max));
        // Update minimum price points
        d3.select("#minx_group_" + i).transition()
            .attr("cx", xScale(minPriceX))
            .attr("cy", yScale(newY1))
            .style("stroke-opacity", 0.38)
            .style("opacity", 0.38);
        // Update horizontal lines
        d3.select("#hline_" + i).transition()
            .attr("x1", 0)
            .attr("y1", yScale(newY1))
            .attr("x2", xScale(minPriceX))
            .attr("y2", yScale(newY1));
    }
    $("#new_slope").hide();
    $("#new_slope_text").hide();
	d3.selectAll(".grid_line").style("opacity", 0.62);
	d3.selectAll(".hline").style("opacity", 0.62);

    // Update data
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < pointData.length; j++) {
            if (data[i]["Category"] == pointData[j]["category"]) {
                if (yName == rawDataObject.pxGB) {
                    data[i][updateField[1]] = pointData[j]["intercept"] + pointData[j]["slope"] * log10(tempData[i][xName]);
                    data[i][updateField[0]] = tempData[i][updateField[1]] * parseInt(tempData[i][capacity]);
                    data[i][updateField[2]] = (tempData[i][yName] - tempData[i][updateField[1]]) / tempData[i][updateField[1]];
                } else {
                    data[i][updateField[0]] = pointData[j]["intercept"] + pointData[j]["slope"] * log10(tempData[i][xName]);
                    data[i][updateField[1]] = tempData[i][updateField[0]] / parseInt(data[i][capacity]);
                    data[i][updateField[2]] = (tempData[i][yName] - tempData[i][updateField[0]]) / tempData[i][updateField[0]];
                }
                data[i][dSlopeName] = newSlope;
            }
        }
    }
}

// Anchor point interactivity
function updateAnchor() {
    // Hide anchor tooltip
    d3.selectAll("#anchor_tooltip").style("opacity", 0);
    // Initialize settings
    var selectedAnchorId = rawDataObject.selectedAnchorId,
        data = rawDataObject.currentData,
        pointData = rawDataObject.pointData,
        xScale = rawDataObject.xScale,
        yScale = rawDataObject.yScale,
		minPriceX = rawDataObject.minPriceX,
		minRangeX = rawDataObject.minRangeX,
		maxRangeX = rawDataObject.maxRangeX,
		minRangeY = rawDataObject.minRangeY,
		maxRangeY = rawDataObject.maxRangeY,
		anchorName = rawDataObject.anchorName;

    // Retrieve user input for new anchor coordinates	
    var newCoord = $("#new_anchor").val().split(","),
        newAnchorX = parseFloat(newCoord[0]),
        newAnchorY = parseFloat(newCoord[1]);
	if (isNaN(newAnchorX) || isNaN(newAnchorY)) {
		alert("Invalid input!");
	} else if (newAnchorX <= minRangeX || newAnchorX > maxRangeX || newAnchorY < minRangeY || newAnchorY > maxRangeY) {
		alert("Input out of bound!");
	} else {
		// Update coordinates of anchor points
		for (var i = 0; i < pointData.length; i++) {
			if (pointData[i]["fillName"] == rawDataObject.selectedAnchorId.substr(7)) {
				pointData[i]["x2"] = log10(newAnchorX);
				pointData[i]["y2"] = newAnchorY;
			}
		}

		// Update anchor point in visualization
		d3.select("#" + selectedAnchorId).transition()
			.attr("cx", xScale(newAnchorX))
			.attr("cy", yScale(newAnchorY))
			.style("stroke-opacity", 0.38)
			.style("opacity", 0.38);
		$("#new_anchor").hide();
		$("#new_anchor_text").hide();

		// Update data
		for (var i = 0; i < data.length; i++) {
			for (var j = 0; j < pointData.length; j++) {
				if (data[i]["Category"] == pointData[j]["category"]) {
					data[i][anchorName.x] = Math.pow(10, pointData[j]["x2"]);
					data[i][anchorName.y] = pointData[j]["y2"];
				}
			}
		}

		// Update line
		updateLine();
	}
}

// Minimum price point interactivity
function updateMinX() {
	var minRangeX = rawDataObject.minRangeX,
		maxRangeX = rawDataObject.maxRangeX;

    // Hide minimum price point tooltip
    d3.selectAll("#min_price_tooltip").style("opacity", 0);
    // Retrieve user input for new minimum price point
    var newMinX = parseInt($("#new_minx").val());
	if (isNaN(newMinX)) {
		alert("Invalid input!");
	} else if ((parseInt(newMinX) < minRangeX) || (parseInt(newMinX) >= maxRangeX)) {
		alert("Input out of bound!");
	} else {
		rawDataObject.minPriceX = newMinX;
	}
    // Update line
    updateLine();
    // Hide minimum price update window
    $("#new_minx").hide();
    $("#new_minx_text").hide();
}

// Functions to update tooltips
// Tooltip mouseover
function tooltipMouseover(d) {
    $("#div_tooltip").remove();
    var tooltip = d3.select("#data_visualization").append("div").attr("id", "div_tooltip").attr("class", "tooltip"),
        tooltipText = tooltipUpdate(d);
    tooltip.transition().style("opacity", 0.9).style("display", "block");
    tooltip.html(tooltipText)
		.style("left", ($(this).position()["left"] + 15) + "px")
		.style("top", ($(this).position()["top"] - 30) + "px");
}
// Tooltip mouseout
function tooltipMouseout(d) {
    d3.select("#div_tooltip").transition().style("opacity", 0).style("display", "none");
}
// Tooltip on click
function tooltipClick(d) {
    // Identify the ID of selected point
    var pointID = "point_" + d3.select(this).attr("cx").replace(".", "_") + "_" + d3.select(this).attr("cy").replace(".", "_");
	// Identify offset of screen to svg
//	var matrix = this.getScreenCTM().translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));
    // Initialize tooltip for clicked points
    var clickTooltip = d3.select("#div_click_tooltip")
        .append("div")
        .attr("id", pointID)
        .attr("class", "click_tooltip");
    if (d3.select(this).attr("r") < 8) { // if the clicked point is not selected
        var tooltipText = tooltipUpdate(d);
        // Click select animation
        d3.select(this)
            .attr("r", 60)
            .style("stroke", "black")
            .style("stroke-width", "2px")
            .style("stroke-opacity", 1)
            .transition()
            .duration(600)
            .attr("r", 8);
        clickTooltip.transition().style("opacity", 0.62); // activate click tooltip
        clickTooltip.html(tooltipText)
            .style("left", ($(this).position()["left"] + 70) + "px")
            .style("top", ($(this).position()["top"] + 30) + "px");
    } else {
        // Deselect the clicked point
        d3.select(this)
            .transition()
            .attr("r", 4.5)
            .style("stroke-opacity", 0);
        d3.selectAll("#" + pointID).transition().style("opacity", 0).remove(); // remove all tooltip divs for the selected point
    }
}

// Update tooltip based on tooltip checkbox selection
function tooltipUpdate(d) {
    var tooltipText = "",
        tooltipOption = "",
		numChecked = 0,
        formatDecimal = d3.format(".2f"),
        formatInteger = d3.format(",f");
    for (var i = 0; i < $(".tooltip_display").length; i++) {
        if ($(".tooltip_display")[i].checked == true) {
			numChecked += 1;
            tooltipOption = $(".tooltip_display")[i].value;
            if ((!isNaN(d[tooltipOption])) && (d[tooltipOption] >= 1000)) {
                tooltipText += tooltipOption + ": " + formatInteger(d[tooltipOption]) + "<br/>";
            } else if ((!isNaN(d[tooltipOption])) && (d[tooltipOption] < 1000)) {
                tooltipText += tooltipOption + ": " + formatDecimal(d[tooltipOption]) + "<br/>";
            } else {
                tooltipText += tooltipOption + ": " + d[tooltipOption] + "<br/>";
            }
        }
    }
	if (numChecked == 0) {
		tooltipText = "No tooltip option selected!"
	}
    return tooltipText;
}

// Draw cross hair while moving mouse
function addCrossHair(xCoord, yCoord) {
	var width = rawDataObject.width,
		height = rawDataObject.height,
		xScale = rawDataObject.xScale,
		yScale = rawDataObject.yScale,
		format = d3.format(",f");
	// Update horizontal cross hair
	d3.select("#h_crosshair")
		.attr("x1", 0)
		.attr("y1", yCoord)
		.attr("x2", width)
		.attr("y2", yCoord)
		.style("display", "block");
	// Update vertical cross hair
	d3.select("#v_crosshair")
		.attr("x1", xCoord)
		.attr("y1", 0)
		.attr("x2", xCoord)
		.attr("y2", height)
		.style("display", "block");
	// Update text label
	d3.select("#crosshair_text")
		.attr("transform", "translate(" + (xCoord + 5) + "," + (yCoord - 5) + ")")
		.text("(" + format(xScale.invert(xCoord)) + " , " + yScale.invert(yCoord).toFixed(2) + ")");
}

// Function to initialize visualization
function initPlot() {
	var dSlopeName = rawDataObject.dSlopeName,
		anchorNameX = rawDataObject.anchorName.x,
		anchorNameY = rawDataObject.anchorName.y,
		capacityName = rawDataObject.capacityName,
		minRangeX = rawDataObject.minRangeX,
		maxRangeX = rawDataObject.maxRangeX;
	
    // Canvas initialization
    d3.selectAll("svg").remove(); // remove visualization panel
    d3.selectAll(".tooltip").remove(); // remove mouseover tooltip, anchor point & minimum price point tooltip
    d3.selectAll("#div_click_tooltip").remove(); // remove click tooltip

    // Click outside foreignObject will hide it
    $(document).mouseup(function (e) {
        var container = $(".externalTextbox");
        if (!container.is(e.target) && container.has(e.target).length === 0) { // if the target of the click isn't the container nor a descendant of the container
            container.hide(); // hide container
            d3.selectAll(".anchor_point").transition().style("stroke-opacity", 0.38).style("opacity", 0.38); // reset effects of all anchor points
            d3.selectAll(".min_price_point").transition().style("stroke-opacity", 0.38).style("opacity", 0.38); // reset effects of all minimum price points
			d3.selectAll(".grid_line").style("opacity", 0.62); // reset effects of all grid lines
			d3.selectAll(".hline").style("opacity", 0.62); // reset effects of all horizontal lines
        }
    });

    // Initialization begins here
    rawDataObject.currentData = subsetData(rawDataObject.buData);	
    if (($("#choose_x").val() == "") || ($("#choose_y").val() == "")) {
        alert("Axis not defined!");
    } else if ((typeof (rawDataObject.currentData) == "undefined") || (rawDataObject.currentData.length == 0)) {
		$("#customize_field").hide();
        $("#error_display").html("<font color='red'>Insufficient data, check more filters!</font>").show();
        setTimeout(function () { $("#error_display").fadeOut("slow"); }, 500);
    } else {
        // Link to data subset
        var data = rawDataObject.currentData;
        // General settings to be passed to plot functions
        var settings = {};
        settings.xName = $("#choose_x").val();
        settings.yName = $("#choose_y").val();
        settings.zName = "Category";

        // Convert relevant fields to numerical
        data.forEach(function (d) {
            d[settings.xName] = +d[settings.xName];
            d[settings.yName] = +d[settings.yName];
		});

        // Determine smallest and largest values for x and y
        settings.yMin = d3.min(extractValue(data, settings.yName));
        settings.yMax = d3.max(extractValue(data, settings.yName));
		
		// Generate discount slope and anchor points if missing, otherwise convert to numerical values
		var uniqueCat = extractValue(data, settings.zName).filter(detectUnique); // extract unique categories for data subset
		rawDataObject.uniqueCat = uniqueCat;
		data.forEach(function (d) {
			d[dSlopeName] = typeof(d[dSlopeName]) == "undefined" ? -0.05 : d[dSlopeName]; // set discount to -0.05 if missing
			d[anchorNameX] = typeof(d[anchorNameX]) == "undefined" ? maxRangeX * 0.05 : d[anchorNameX]; // set anchor x to be maximum of x
			for (var i = 0; i < uniqueCat.length; i++) {
				if (d[settings.zName] == uniqueCat[i]) {
					var tempValue = settings.yMin + 0.5 * i * (settings.yMax - settings.yMin) / uniqueCat.length; // calculate values of anchor y 
					if (settings.yName == rawDataObject.pxGB) { // if y represents price per capacity ...
						d["AnchorPerGB"] = tempValue; // set price per capacity
					} else { // if y represents actual price
						d[anchorNameY] = (typeof(d[anchorNameY]) == "undefined") ? tempValue : d[anchorNameY]; // set anchor y if missing
						d["AnchorPerGB"] = d[anchorNameY] / d[capacityName]; // set price per capacity
					}
				}
			}
			d[dSlopeName] =+ d[dSlopeName]; // convert discount slope to numerical
            d[anchorNameX] = +d[anchorNameX]; // convert anchor x to numerical
            d[anchorNameY] = +d[anchorNameY]; // convert anchor y to numerical
		});

        // Save settings to global
        rawDataObject.settings = settings;
		
        // Call visualization functions
		detectCustomer();
        scatterPlot(data);
        addLine(data);
		updateLine();
        addAnchorPoints();
        addMinPricePoint();
		
        // To prevent data overwrite, log data only if it doesn't exist
        if ((rawDataObject.userLog == "") && ($(".dot").length > 0)) {
            var finalHeader = Object.keys(data[0]); // extract column headers
            finalHeader.splice(finalHeader.indexOf("Category"), 1); // remove "category" key-value pair generated for the purpose of linkage
			if ($.inArray("AnchorPerGB", finalHeader) > -1) {
				finalHeader.splice(finalHeader.indexOf("AnchorPerGB"), 1); // remove "AnchorPerGB" key-value pair generated for the purpose of linkage
			}
            rawDataObject.userLog = finalHeader.toString().concat("\n"); // convert array to comma separated string
        }
    }
}
