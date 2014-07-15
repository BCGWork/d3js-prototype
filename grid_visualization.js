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
    var output = "<font color='#cd5c0a'>Data Loaded!</font>";
	$("#file_name").html("");
/*
    output += " - FileName: " + escape(file.name) + "<br/>";
    output += " - FileType: " + (file.type || "n/a") + "<br/>";
    output += " - FileSize: " + file.size + " bytes<br/>";
    output += " - LastModified: " + (file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : "n/a") + "<br/>";
*/
    readData(file);
	$("#file_name").html(file.name);
    $("#upload_status").html(output);
	$("#upload_status").show();
	setTimeout(function () { $("#upload_status").fadeOut("slow"); }, 800);
    d3.select("#grid_svg").remove();
	d3.select("#div_click_tooltip").remove();
}

// Read and parse data from csv
function readData(file) {
    var reader = new FileReader(),
		hideEffect = "fold";
    reader.readAsText(file);
    reader.onload = function (event) {
		delete rawDataObject.dataObject;
        var csv = event.target.result;
		try {
			rawDataObject.dataObject = $.csv.toObjects(csv);
		}
		catch(err) {
			$.alert("Please load comma-delimited (.csv) data!");
			throw("Invalid data format.");
		}
        
		defineBu(rawDataObject.buName);
		localStorage.clear();
		
		$("#control_tabs").hide(hideEffect, 1500);
		$("#visualization_tabs").hide(hideEffect, 1500);
    };
    reader.onerror = function () {
        $.alert("Unable to read " + file.fileName);
    };
}

// Populate drop down menu for business unit
function defineBu(name) {
    $("#choose_bu").empty();
    $("#choose_bu").append("<option value=''> Select a business unit: &emsp;&emsp;</option>");
	if (typeof(rawDataObject.dataObject[0][name]) == "undefined") {
		$("#choose_bu").append("<option value='default Business Unit'> Proceed with default Business Unit </option>");
	} else {
		var buList = extractValue(rawDataObject.dataObject, name).filter(detectUnique);
		for (var i = 0; i < buList.length; i++) {
			$("#choose_bu").append("<option value='" + buList[i] + "'> Business Unit: " + buList[i] + " </option>");
		}
	}
	$("#bu_div").show("fade");
	$("#choose_bu").selectmenu();
	$("#choose_bu").on("selectmenuchange", popControl);
}

// Populate filters and axes selector
function popControl() {
	var prevBu = rawDataObject.prevBu,
		xName = rawDataObject.xList[0],
		yName = rawDataObject.yList[0],
		buName = rawDataObject.buName,
		data = rawDataObject.dataObject.slice(),
		newBu = $("#choose_bu").val(),
		showEffect = "drop";
		
	saveSession(prevBu);
    d3.select("#grid_svg").remove();
	d3.select("#div_click_tooltip").remove();
	$("#input_xmin").val("");
	$("#input_xmax").val("");
	$("#input_ymin").val("");
	$("#input_ymax").val("");
	
	
	if (newBu != "default Business Unit") {
		for (var i = data.length - 1; i >= 0; i--) {
			if (data[i][buName] != $("#choose_bu").val()) {
				data.splice(i, 1);
			}
		}
		rawDataObject.buData = data;
	} else {
		rawDataObject.buData = data;
	}
	
	defineX(Object.keys(data[0]));
	defineY(Object.keys(data[0]));
	defineTooltip(Object.keys(data[0]));
	createCheckBox(data);
    $("#choose_x").val(xName);
	$("#choose_y").val(yName);
	$("#control_tabs").tabs();
	$("#visualization_tabs").tabs({ selected: 1 });
	$("#control_tabs").show(showEffect);
	$("#visualization_tabs").show(showEffect);
	
	$("#choose_x").selectmenu({
		width: $(this).width()
	});
	$("#choose_y").selectmenu({
		width: $(this).width()
	});
	
	$("#input_xmin").attr("placeholder", "enter minimum x");
	$("#input_xmax").attr("placeholder", "enter maximum x");
	$("#input_ymin").attr("placeholder", "enter minimum y");
	$("#input_ymax").attr("placeholder", "enter maximum y");
	
	$("#input_xmin").mask("#,##0", {reverse:true, maxlength:false});
	$("#input_xmax").mask("#,##0", {reverse:true, maxlength:false});
	$("#input_ymin").mask("#0.00", {reverse:true, maxlength:false});
	$("#input_ymax").mask("#0.00", {reverse:true, maxlength:false});

	if (typeof(localStorage[newBu]) != "undefined") {
		retrieveSession(newBu);
		updateAllSvg();
	}
	
	for (var i = 0; i < 1; i++) {
		for (var key in data[i]) {
			if (key.toLowerCase().substring(0, 6) == "filter") {
				$(".checkbox[name='" + key + "'][value='" + data[i][key] + "']").prop("checked", true).button("refresh");
			}
			updateSelectAll(key);
		}
	}
	updateAllSvg();
}

// Define x-axis variable
function defineX(dataHeader) {
    $("#choose_x").empty();
	var xList = rawDataObject.xList;
	for (var i = 0; i < xList.length; i++) {
		$("#choose_x").append("<option value='" + xList[i] + "'> x: " + xList[i] + " </option>");
	}
}

// Define y-axis variable
function defineY(dataHeader) {
    $("#choose_y").empty();
	var yList = rawDataObject.yList;
	for (var i = 0; i < yList.length; i++) {
		$("#choose_y").append("<option value='" + yList[i] + "'> y: " + yList[i] + " </option>");
	}
}

// Define tooltip display variable
function defineTooltip(dataHeader) {
    $("#tooltip_checkbox").empty();
	var tooltipHideList = ["Category", "AnchorPerGB", "pbCategory"];
	tooltipHideList.push(rawDataObject.anchorName.x);
	tooltipHideList.push(rawDataObject.anchorName.y);
	tooltipHideList.push(rawDataObject.dSlopeName);
	tooltipHideList.push(rawDataObject.buName);
	
	var tooltipSelectAllCb = "<input type='checkbox' id='tooltip_selectall' onchange='tooltipSelectAll(this)'/><label class='tooltip_label' for='tooltip_selectall'><i>Select All</i></label>"
	$("#tooltip_checkbox").append("<h3>Tooltip Settings</h3><div></div>");
	$("#tooltip_checkbox div").append(tooltipSelectAllCb).append("<br/>");
    for (var i = 0; i < dataHeader.length; i++) {
        if ($.inArray(dataHeader[i], tooltipHideList) == -1) {
			$("#tooltip_checkbox div").append("<input type='checkbox' onchange='updateSelectAll(&apos;tooltip&apos;)' id='tooltip_checkbox_" + i + "' class='tooltip_display' name='tooltip' value='" + dataHeader[i] + "'/><label class='label_selectall' for='tooltip_checkbox_" + i + "'>" + dataHeader[i] + "</label><br class='tooltip_label' />");
        }
    }

	$("#tooltip_checkbox").accordion({
		header: "h3",
		active: false,
		collapsible: true,
		heightStyle: "content"
    });
	$("#tooltip_checkbox").accordion("refresh");
	$("#tooltip_selectall").button();
	$(".label_selectall").css("font-size", "11px");
	$(".tooltip_display").each(function(){$(this).button();});
	$(".tooltip_label").css("font-size", "11px");
}

// Enable select all feature for tooltips
function tooltipSelectAll(source) {
    var tooltipCheckbox = $(".tooltip_display");
    for (var i = 0; i < tooltipCheckbox.length; i++) {
        tooltipCheckbox[i].checked = source.checked;
    }
	tooltipCheckbox.button("refresh");
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
	var filterCheckbox = $(".checkbox[name='" + filterName + "']");
    for (var i = 0; i < filterCheckbox.length; i++) {
        filterCheckbox[i].checked = source.checked;
    }
	filterCheckbox.button("refresh");
}

// Update select all checkbox for filters
function updateSelectAll(filterName) {
	var checkSum = 0;
	if (filterName == "tooltip") {
		var checkMax = $(".tooltip_display").length;
		$(".tooltip_display").each(function(d){ checkSum += this.checked;});
	} else {
		var checkMax = $(".checkbox[name='" + filterName + "']").length;
		$(".checkbox[name='" + filterName + "']").each(function(d){ checkSum += this.checked;});
	}
	if (checkSum == checkMax) {
		$("#" + filterName.replace(/,|\.|-| /g, "") + "_selectall").prop("checked", true).button("refresh");
	} else {
		$("#" + filterName.replace(/,|\.|-| /g, "") + "_selectall").prop("checked", false).button("refresh");
	}
}

// Add filters and create check boxes for each
function createCheckBox(data) {
    $("#filter_checkbox").empty();
    var dataHeader = Object.keys(data[0]),
        filterName = defineFilters(dataHeader),
		j = 0;

    for (var i = 0; i < filterName.length; i++) {
        $("#filter_checkbox").append("<div><h3>" + filterName[i] + "</h3><div class=" + filterName[i].replace(/,|\.|-| /g, "") + "></div></div>");
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
		var selectAllCb = "<input type='checkbox' id=" + filterId + "_selectall class='selectall_checkbox' onchange='filterSelectAll(&apos;" + filterName[i] + "&apos;, this)'/><label class='label_selectall' for=" + filterId + "_selectall><i>Select All</i></label>";
		$("." + filterName[i].replace(/,|\.|-| /g, "")).append(selectAllCb).append("<br/>");
        for (var k = 0; k < uniqueFilterData.length; k++) {
			$("." + filterName[i].replace(/,|\.|-| /g, "")).append("<input type='checkbox' onchange='updateSelectAll(&apos;" + filterName[i] + "&apos;)' id='checkbox_" + j + "' name='" + filterName[i] + "' class='checkbox' value='" + uniqueFilterData[k] + "'/><label class='checkbox_label' for='checkbox_" + j + "'>" + uniqueFilterData[k] + "</label><br/>");
		j += 1;
        }
    }
	
	$("#filter_checkbox div").accordion({
		header: "h3",
		active: false,
		collapsible: true,
		heightStyle: "content"
    });
	$(".selectall_checkbox").each(function(){$(this).button();});
	$(".checkbox").each(function(){$(this).button();});
	$(".label_selectall").css("font-size", "11px");
	$(".checkbox_label").css("font-size", "11px");
}

// Subset data for visualization
function subsetData(input_data) {
    // Detect the names of unchecked filters
    var uncheckedFilterObject = {},
        uncheckedFilterValue = [];
    for (var i = 0; i < $(".checkbox").length; i++) {
        if ($(".checkbox")[i].checked == false) {
            if (!($(".checkbox")[i].name in uncheckedFilterObject)) {
                uncheckedFilterObject[$(".checkbox")[i].name] = [];
                uncheckedFilterObject[$(".checkbox")[i].name].push($(".checkbox")[i].value);
            } else {
                uncheckedFilterObject[$(".checkbox")[i].name].push($(".checkbox")[i].value);
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
                data[i]["Category"] += data[i][filterKey] + "; ";
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
		.domain([yMin, yMax])
        .domain([yMin * 0.9, yMax * 1.1])
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
		.attr("id", "grid_svg")
        .attr("width", width + margin.left + margin.right)
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
        .attr("x", margin.left)
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
		.style("cursor", "pointer")
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
	legend.on("mouseover", function () {d3.select(this).style("stroke-width", 1.5).style("stroke", "black");})
	legend.on("mouseout", function () {d3.select(this).style("stroke-width", 0);});
}

// Add grid lines
function addLine(data) {
    // Initialize settings
    var anchorName = rawDataObject.anchorName,
		capacityName = rawDataObject.capacityName,
		customerName = rawDataObject.customerName,
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
				"customer": data[i][customerName],
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
        if (yName == rawDataObject.yList[1]) {
            lineVals[i].anchorY = lineVals[i].anchorYperGB;
        } else {
            lineVals[i].anchorY = lineVals[i].anchorYpx;
        }
        // Calculate coordinates, slope and intercept
        var coord = findLine(lineVals[i].dSlope * lineVals[i].anchorY, log10(minPriceX), log10(lineVals[i].anchorX), lineVals[i].anchorY, log10(maxRangeX * 0.5));
        lineVals[i].intercept = coord.intercept;
        coord["fillName"] = "group_" + i;
        coord["category"] = lineVals[i]["category"];
		coord["customer"] = lineVals[i]["customer"];
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
				$(".externalObject").remove();
				d3.selectAll(".grid_line").style("opacity", 0.1);
				d3.selectAll(".hline").style("opacity", 0.1);
				d3.select(this).style("opacity", 1);
				
				var dialogBox = $("#data_visualization").append("<div class='externalObject'></div>"),
					divText = "<b>Enter New Discount Slope:</b>";
				divText += "<input type='text' id=new_slope placeholder='current value: " + (coord.slope / coord.y2).toFixed(4) + "'/>";
				$(".externalObject").append(divText);
				$(".externalObject").dialog({
					autoOpen: true,
					closeOnEscape: false,
					modal: true,
					show: {
						effect: "fold"
					},
					buttons: {
						"Submit": function() {
							updateLine();
							d3.selectAll(".grid_line").style("opacity", 0.62);
							d3.selectAll(".hline").style("opacity", 0.62);
							$(this).remove();
						},
						"Cancel": function() {
							d3.selectAll(".grid_line").style("opacity", 0.62);
							d3.selectAll(".hline").style("opacity", 0.62);
							$(this).remove();
						}
					}
				});
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
			rawDataObject.selectedAnchorId = d3.select(this).attr("id");
			var dialogBox = $("#data_visualization").append("<div class='externalObject'></div>"),
				divText = "<b>Enter New Anchor Coordinates:</b>";
			divText += "<input type='text' id=new_anchor_x placeholder='current x value: " + format(Math.pow(10, d["x2"])) + "'/>";
			divText += "<input type='text' id=new_anchor_y placeholder='current y value: " + d["y2"].toFixed(2) + "'/>";
			$(".externalObject").append(divText);
			$(".externalObject").dialog({
				autoOpen: true,
				closeOnEscape: false,
				modal: true,
				show: {
					effect: "fold"
				},
				buttons: {
					"Submit": function() {
						updateAnchor();
						$(this).remove();
					},
					"Cancel": function() {
						$(this).remove();
					}
				}
			});
			
			$("#new_anchor_x").mask("#,##0", {reverse:true, maxlength:false});
			$("#new_anchor_y").mask("#0.00", {reverse:true, maxlength:false});
        });
}

// Add minimum price points
function addMinPricePoint() {
    // Initialize settings
    var pointData = rawDataObject.pointData,
		minPriceX = rawDataObject.minPriceX,
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
        .on("click", function () {
			var dialogBox = $("#data_visualization").append("<div class='externalObject'></div>"),
				divText = "<b>Enter New Minimum Price:</b>";
			divText += "<input type='text' id=new_minx placeholder='current value: " + format(minPriceX) + "'/>";
			$(".externalObject").append(divText);
			$(".externalObject").dialog({
				autoOpen: true,
				closeOnEscape: false,
				modal: true,
				show: {
					effect: "fold"
				},
				buttons: {
					"Submit": function() {
						updateMinX();
						$(this).remove();
					},
					"Cancel": function() {
						$(this).remove();
					}
				}
			});
			
			$("#new_minx").mask("#,##0", {reverse:true, maxlength:false});
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
		newPointList = rawDataObject.newPointList,
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
	if (typeof($("#new_slope").val()) == "undefined" || isNaN(parseFloat($("#new_slope").val()))) {
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
	
	// Add new points
	d3.selectAll(".newpoints").remove();
	for (var key in newPointList) {
		var argList = key.split("| "),
			pointType = argList[0],
			newPointCategory = argList[1],
			competitorName = argList[2],
			newX = newPointList[key]["x"],
			newY = newPointList[key]["y"];
		if ($.inArray(newPointCategory, extractValue(data, "Category")) > -1) {
			addNewPoint(pointType, competitorName, newX, newY, newPointCategory);
		}
	}

    // Update data
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < pointData.length; j++) {
            if (data[i]["Category"] == pointData[j]["category"]) {
                if (yName == rawDataObject.yList[1]) {
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
    var newAnchorX = parseFloat($("#new_anchor_x").val().replace(/,/g, "")),
        newAnchorY = parseFloat($("#new_anchor_y").val().replace(/,/g, ""));
	if (isNaN(newAnchorX) || isNaN(newAnchorY)) {
		return;
	} else if (newAnchorX <= minRangeX || newAnchorX > maxRangeX || newAnchorY < minRangeY || newAnchorY > maxRangeY) {
		$.alert("Input out of bound! e.g. (" + minPriceX * 100 + ", " + ((minRangeY + maxRangeY) / 2).toFixed(2) + ")");
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
		maxRangeX = rawDataObject.maxRangeX,
		minPriceX = rawDataObject.minPriceX;

    // Retrieve user input for new minimum price point
	var newMinX = $("#new_minx").val().replace(/,/g, "");
	
	if (isNaN(parseInt(newMinX))) {
		return;
	} else if ((parseInt(newMinX) < minRangeX) || (parseInt(newMinX) >= maxRangeX)) {
		$.alert("Input out of bound! e.g. (" + minPriceX * 100 + ")");
	} else {
		rawDataObject.minPriceX = parseInt(newMinX);
	}
    // Update line
    updateLine();
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
	/* // Identify offset of screen to svg
	var matrix = this.getScreenCTM().translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));
	*/
    // Initialize tooltip for clicked points
    var clickTooltip = d3.select("#div_click_tooltip")
        .append("div")
        .attr("id", pointID)
        .attr("class", "click_tooltip");
	$(".click_tooltip").each(function(){$(this).draggable();});
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
	rawDataObject.prevBu = $("#choose_bu").val();
	
    // Canvas initialization
    d3.selectAll("#grid_svg").remove(); // remove visualization panel
    d3.selectAll(".tooltip").remove(); // remove mouseover tooltip, anchor point & minimum price point tooltip
    d3.selectAll("#div_click_tooltip").remove(); // remove click tooltip

    // Initialization begins here
    if ((typeof(rawDataObject.currentData) == "undefined") || (rawDataObject.currentData.length == 0)) {
        $("#error_display").html("<font color='red'>Insufficient data, check more filters!</font>").show();
        setTimeout(function () { $("#error_display").fadeOut("slow"); }, 500);
    } else {
		var dSlopeName = rawDataObject.dSlopeName,
			anchorNameX = rawDataObject.anchorName.x,
			anchorNameY = rawDataObject.anchorName.y,
			capacityName = rawDataObject.capacityName,
			format = d3.format(",f"),
			inputMinX = parseInt($("#input_xmin").val().replace(/,/g, "")),
			inputMaxX = parseInt($("#input_xmax").val().replace(/,/g, "")),
			inputMinY = parseFloat($("#input_ymin").val().replace(/,/g, "")),
			inputMaxY = parseFloat($("#input_ymax").val().replace(/,/g, ""));

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

        // Determine smallest and largest values for y
		settings.xMin = d3.min(extractValue(data, settings.xName));
		settings.xMax = d3.max(extractValue(data, settings.xName));
        settings.yMin = d3.min(extractValue(data, settings.yName));
        settings.yMax = d3.max(extractValue(data, settings.yName));
		if (parseFloat(inputMinX) > parseFloat(inputMaxX) || parseFloat(inputMinY) > parseFloat(inputMaxY)) {
			$.alert("Axes maximum range must be greater than minimum!");
			return;
		} else {
			rawDataObject.minRangeX = (isNaN(inputMinX) ? 100 : parseFloat(inputMinX));
			rawDataObject.maxRangeX = (isNaN(inputMaxX) ? 10000000000 : parseFloat(inputMaxX));
			settings.yMin = (isNaN(inputMinY) ? settings.yMin : parseFloat(inputMinY));
			settings.yMax = (isNaN(inputMaxY) ? settings.yMax : parseFloat(inputMaxY));
		}
		$("#input_xmin").attr("placeholder", format(rawDataObject.minRangeX));
		$("#input_xmax").attr("placeholder", format(rawDataObject.maxRangeX));
		$("#input_ymin").attr("placeholder", settings.yMin.toFixed(2));
		$("#input_ymax").attr("placeholder", settings.yMax.toFixed(2));
		rawDataObject.minPriceX = rawDataObject.minRangeX * 100;
		
		// Generate discount slope and anchor points if missing, otherwise convert to numerical values
		var uniqueCat = extractValue(data, settings.zName).filter(detectUnique); // extract unique categories for data subset
		rawDataObject.uniqueCat = uniqueCat;
		data.forEach(function (d) {
			d[dSlopeName] = typeof(d[dSlopeName]) == "undefined" ? -0.01 : d[dSlopeName]; // set discount to -0.05 if missing
			d[anchorNameX] = typeof(d[anchorNameX]) == "undefined" ? settings.xMax * 0.8 : d[anchorNameX]; // set anchor x to be maximum of x
			for (var i = 0; i < uniqueCat.length; i++) {
				if (d[settings.zName] == uniqueCat[i]) {
					var tempValue = settings.yMin + 0.5 * i * (settings.yMax - settings.yMin) / uniqueCat.length; // calculate values of anchor y 
					if (settings.yName == rawDataObject.yList[1]) { // if y represents price per capacity ...
						d["AnchorPerGB"] = tempValue; // set price per capacity
					} else { // if y represents actual price
						d[anchorNameY] = (typeof(d[anchorNameY]) == "undefined" || isNaN(d[anchorNameY])) ? tempValue : d[anchorNameY]; // set anchor y if missing
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
    }
}
