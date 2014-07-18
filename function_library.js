// Resize window event listener
$(window).resize(function () {
    rawDataObject.width = $(window).width() * 0.79 - rawDataObject.margin.left - rawDataObject.margin.right;
    rawDataObject.height = $(window).height() * 0.85 - rawDataObject.margin.top - rawDataObject.margin.bottom;
	if (typeof(rawDataObject.currentData) != "undefined") {
		updateAllSvg();
	}
});

/* // Click outside foreignObject will hide it
$(document).mouseup(function (e) {
    var container = $(".externalObject");
    if (!container.is(e.target) & container.has(e.target).length === 0) { // if the target of the click isn't the container nor a descendant of the container
        container.remove(); // hide container
        d3.selectAll(".anchor_point").transition().style("stroke-opacity", 0.38).style("opacity", 0.38); // reset effects of all anchor points
        d3.selectAll(".min_price_point").transition().style("stroke-opacity", 0.38).style("opacity", 0.38); // reset effects of all minimum price points
        d3.selectAll(".grid_line").style("opacity", 0.62); // reset effects of all grid lines
        d3.selectAll(".hline").style("opacity", 0.62); // reset effects of all horizontal lines
    }
});
*/

// Submit dialog box by hitting enter
$(document).delegate('.ui-dialog', 'keyup', function (e) {
    var tagName = e.target.tagName.toLowerCase();
    tagName = (tagName === 'input' && e.target.type === 'button') ? 'button' : tagName;
    if (e.which === $.ui.keyCode.ENTER && tagName !== 'textarea' && tagName !== 'select' && tagName !== 'button') {
        $(this).find('.ui-dialog-buttonset button').eq(0).trigger('click');
        return false;
    }
});

// Format alert box
$.extend({
    alert: function (message) {
        $("<div></div>").dialog({
            buttons: {
                "OK": function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(this).remove();
            },
            resizable: false,
            title: "Alert!",
            modal: true
        }).text(message);
    }
});

// Emit click signals to selection
jQuery.fn.doClick = function () {
	this.each(function (i, e) {
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		e.dispatchEvent(evt);
	});
};

// Sort number
function sortNumber(a, b) {
    return a - b;
}

// Log base 10
function log10(x) {
    return Math.log(x) / Math.LN10;
}

// Pull all values of a key from an object
function extractValue(object, key) {
    return object.map(function (el) {
        return el[key];
    });
}

// Find unique values in object array
function detectUnique(value, index, self) {
    return self.indexOf(value) == index;
}

// Print grid windows
function printGrid() {
    var gridContent = $("#data_visualization").html(), // get svg content
        printWindow = window.open(); // open new window

    printWindow.document.write("<html><title>View/Print Grid</title><head>"); // open tags
    printWindow.document.write("<link rel='stylesheet' type='text/css' href='styles.css'>"); // import default css
    printWindow.document.write("<link rel='stylesheet' type='text/css' href='library/jquery-ui.min.css'>"); // import JQuery UI css
	printWindow.document.write("<style type='text/css' media='print'>@page{size: landscape;}</style>"); // print in landscape format
    printWindow.document.write("<script type='text/javascript' src='library/jquery-1.11.0.min.js'></script>"); // import JQuery
    printWindow.document.write("<script type='text/javascript' src='library/jquery-ui.min.js'></script>"); // import JQuery UI js
    printWindow.document.write("</head><body>");
    printWindow.document.write("<button class='buttons' onclick='window.print()'>Print</button>"); // create print button
    printWindow.document.write("<button class='buttons' onclick='window.close()'>Close</button><hr/>"); // create close button
    printWindow.document.write(gridContent); // reproduce svg content
	printWindow.document.write("<script type='text/javascript'>$('#customize_field').remove();$('.buttons').button();</script>");
    printWindow.document.write("</body></html>"); // end page
}

// Log user activity
function logOutput() {
    var currentData = rawDataObject.currentData,
		data = rawDataObject.dataObject.slice(),
		customerName = rawDataObject.customerName;
		
	var finalHeader = Object.keys(currentData[0]); // extract column headers
	finalHeader.splice(finalHeader.indexOf("Category"), 1); // remove "category" key-value pair generated for the purpose of linkage
	if ($.inArray("AnchorPerGB", finalHeader) > -1) {
		finalHeader.splice(finalHeader.indexOf("AnchorPerGB"), 1); // remove "AnchorPerGB" key-value pair generated for the purpose of linkage
	}
	var userLog = finalHeader.toString().concat("\n"); // convert array to comma separated string
		
	for (var i = 0; i < data.length; i++) {
		for (var j = 0; j < currentData.length; j++) {
			if ((currentData[j]["Category"] == data[i]["Category"]) & (currentData[j][customerName] == data[i][customerName])) {
				for (var key in data[i]) {
					data[i][key] == currentData[j][key];
				}
			}
		}
	}
    // Take snapshot of current settings
    for (var i = 0; i < data.length; i++) {
        var tempLog = [];
        for (var key in data[i]) {
            if ((key != "Category") && (key != "AnchorPerGB")) {
                tempLog.push(data[i][key]);
            }
        }
        userLog = userLog.concat(tempLog.toString() + "\n");
    }
	return userLog;
}

// Export output to text file
function exportToText() {
	var userLog = logOutput();
    var textToExport = new Blob([userLog], {
        type: "text/html",
        endings: "native"
    });
    var downloadLink = document.createElement("a");
    downloadLink.download = "UpdatedData.csv";
    if (window.webkitURL != null) {
        // Chrome allows the link to be clicked without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textToExport);
    } else {
        // Firefox requires the link to be added to the DOM before it can be clicked.
        function destroyClickedElement(event) {
            document.body.removeChild(event.target);
        }
        downloadLink.href = window.URL.createObjectURL(textToExport);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }
    downloadLink.click();
}

// Toggle notepad
function toggleNote() {
	$("#notepad").width(250);
	$("#notepad").height(250);
	$("#notepad_div").draggable({handles: "span"});
	if ($("#notepad_div").css("display") == "none") {
		$("#notepad_div").css("display", "inline-block");
	} else {
		$("#notepad_div").hide();
	}
}

// Save current session to local storage
function saveSession(sessionName) {
    var storageObject = {};
    storageObject.storageNames = [$("#choose_x").val(), $("#choose_y").val()],
        storageObject.storageAxesRange = [$("#input_xmin").val(), $("#input_xmax").val(), $("#input_ymin").val(), $("#input_ymax").val()],
        storageObject.storageFilters = [],
        storageObject.storageTooltips = [];
    $(".checkbox").each(function (i) {
        this.checked ? storageObject.storageFilters.push(i) : ""
    });
    $(".tooltip_display").each(function (i) {
        this.checked ? storageObject.storageTooltips.push(i) : ""
    });

    localStorage.setItem(sessionName, JSON.stringify(storageObject));
}

// Retrieve previous session to local storage
function retrieveSession(sessionName) {
    var storageText = localStorage.getItem(sessionName);
    var storageObject = JSON.parse(storageText);
    var storageNames = storageObject.storageNames,
        storageAxesRange = storageObject.storageAxesRange,
        storageFilters = storageObject.storageFilters,
        storageTooltips = storageObject.storageTooltips;
	var filterName = [];

    $("#choose_x").val(storageNames[0]);
    $("#choose_y").val(storageNames[1]);
    $("#input_xmin").val(storageAxesRange[0]);
    $("#input_xmax").val(storageAxesRange[1]);
    $("#input_ymin").val(storageAxesRange[2]);
    $("#input_ymax").val(storageAxesRange[3]);
    $(".checkbox").each(function (i) {
		filterName.push($(this).attr("name"));
        $.inArray(i, storageFilters) > -1 ? this.checked = true : this.checked = false;
		$(this).button("refresh");
    });
	for (var i = 0; i < filterName.filter(detectUnique).length; i++) {
		updateSelectAll(filterName.filter(detectUnique)[i]);
	}
    $(".tooltip_display").each(function (i) {
        $.inArray(i, storageTooltips) > -1 ? this.checked = true : this.checked = false;
		$(this).button("refresh");
		updateSelectAll("tooltip");
    });
}

// Switch back to Grid
function switchToGrid() {
    $("#playbook_choose_variables").hide();
    $("#pb_svg").hide();

    $("#choose_variables").show();
    $("#grid_svg").show();
}

// Update all svg
function updateAllSvg() {
    rawDataObject.currentData = subsetData(rawDataObject.buData);
    initPlot();
	pbDropDown();
    if ((typeof (rawDataObject.currentData) != "undefined") & (rawDataObject.currentData.length > 0) & ($("#choose_x_pb").val() !== null) & ($("#choose_y_pb").val() !== null)) {
        createPbCategory(rawDataObject.currentData);
        createPlaybook();
    } else {
		$("#pb_svg").remove();
		$("#pbDiv_click_tooltip").remove();
		$("#pb_error_display").html("<font color='red'>Insufficient data, check more filters!</font>").show();
        setTimeout(function () { $("#pb_error_display").fadeOut("slow"); }, 500);
	}
}

// Add change log button
function changeLog() {
    var changeLogText = "<div class='log_div'>";
/*
	var v0_x0Change = "<h4>v0.x</h4><div><ul>";
	v0_x0Change += "<li><b>New Features</b></li><ol>";
	v0_x0Change += "<li></li>";
	v0_x0Change += "</ol><br/><li><b>Bug Fixes</b></li><ol>";
	v0_x0Change += "<li></li>";
	v0_x0Change += "</ol><br/><li><b>UI Changes</b></li><ol>";
	v0_x0Change += "<li></li>";
	v0_x0Change += "</ol></ul></div>";
*/

	var v0_70Change = "<h4>v0.7</h4><div><ul>";
	v0_70Change += "<li><b>New Features</b></li><ol>";
	v0_70Change += "<li>One combination of filters will be plotted right after choosing business unit.</li>";
	v0_70Change += "<li>Added button to toggle sticky notes.</li>";
	v0_70Change += "<li>Added placeholder for client logo. Logo leads to client's home page.</li>";
	v0_70Change += "<li>Extended expiration date to 2014-07-25.</li>";
	v0_70Change += "</ol><br/><li><b>Bug Fixes</b></li><ol>";
	v0_70Change += "<li>Fixed a bug causing check boxes not updating when switching among business units.</li>";
	v0_70Change += "<li>Fixed a bug causing playbook customer filter not updating when switching between modules.</li>";
	v0_70Change += "<li>Fixed some minor bugs to standardize all modules.</li>";
	v0_70Change += "</ol><br/><li><b>UI Changes</b></li><ol>";
	v0_70Change += "<li>Redesigned checkbox area for better appearance.</li>";
	v0_70Change += "<li>Redesigned all drop down menus.</li>";
	v0_70Change += "<li>Reformatted the area for overwriting axes range.</li>";
	v0_70Change += "<li>Width of textbox in dialog windows is now dynamically set based on placeholder values.</li>";
	v0_70Change += "<li>Slightly improved positioning for Control Panel and plot area, so that plots won't go to next line whenever browser is resized.</li>";
	v0_70Change += "<li>Printing grid is now defaulted to landscape format.</li>";
	v0_70Change += "<li>Tooltip options will always be sorted in alphabetical order.</li>";
	v0_70Change += "<li>Remade change log for easy reading.</li>";
	v0_70Change += "</ol></ul></div>";

	var v0_60Change = "<h4>v0.6</h4><div><ul>";
	v0_60Change += "<li><b>New Features</b></li><ol>";
	v0_60Change += "<li>Exported data will contain all rows from original data source.</li>";
	v0_60Change += "<li>Enabled manual overwrite of y-axis position in playbook.</li>";
	v0_60Change += "<li>All points in playbook are clickable and enabled &quot;Click All&quot; button.</li>";
	v0_60Change += "<li>Tooltips generated by clicks are now draggable.</li>";
	v0_60Change += "<li>Remade checkbox logic so that &quot;select all&quot; field will update automatically with current selection.</li>";
	v0_60Change += "<li>Overwriting axes range will now automatically update the chart.</li>";
	v0_60Change += "<li>Extended expiration date to 2014-07-18.</li>";
	v0_60Change += "</ol><br/><li><b>Bug Fixes</b></li><ol>";
	v0_60Change += "<li>Fixed a bug of not recording new grid point correctly.</li>";
	v0_60Change += "<li>Fixed a bug generating duplicated input listeners when escaping external dialog boxes.</li>";
	v0_60Change += "<li>Fixed a bug causing difficulties to check filters and tooltips.</li>";
	v0_60Change += "<li>Adding competitor price by clicking on ask price is deprecated.</li>";
	v0_60Change += "</ol><br/><li><b>UI Changes</b></li><ol>";
	v0_60Change += "<li>Added color for all quadrants in playbook.</li>";
	v0_60Change += "<li>Print window will show more information from grid.</li>";
	v0_60Change += "<li>Added color indicator when adding new point.</li>";
	v0_60Change += "<li>Changed cursor appearance for certain events.</li>";
	v0_60Change += "<li>File name will be displayed after loading file. Minor bug fix to file browser button. Added exception message.</li>";
	v0_60Change += "<li>Remade headings: Click title to Email; Click version number to view change log; Changed logo.</li>";
	v0_60Change += "<li>Minor opacity changes when interacting with points.</li>";	
	v0_60Change += "</ol></ul></div>";
	
    var v0_50Change = "<h4>v0.5</h4><div><ul>";
	v0_50Change += "<li><b>New Features</b></li><ol>";
	v0_50Change += "<li>New points (ask price, competitor price, grid point) will be memorized and resumed when detected. Right-click removes them completely.</li>";
	v0_50Change += "<li>Enabled automatic formatting for all input text boxes.</li>";
	v0_50Change += "<li>Added drop down menu to adjust circle size for playbook.</li>";
	v0_50Change += "<li>Extended expiration date to 2014-07-11.</li>";
	v0_50Change += "</ol><br/><li><b>Bug Fixes</b></li><ol>";
	v0_50Change += "<li>Fixed a bug causing svg to move outside visualization panel when resizing window.</li>";
	v0_50Change += "<li>Some other minor bug fixes and code clean up.</li>";
	v0_50Change += "</ol><br/><li><b>UI Changes</b></li><ol>";
	v0_50Change += "<li>Applied new theme to entire tool and reformatted most layout.</li>";
	v0_50Change += "<li>Added animation for some sections when entering and leaving.</li>";
	v0_50Change += "<li>Remade all input text boxes.</li>";
	v0_50Change += "<li>Removed confirmation window, so that sessions will be automatically resumed when switching among business units.</li>";
    v0_50Change += "</ol></ul></div>";

    var v0_40Change = "<h4>v0.4</h4><div><ul>";
	v0_40Change += "<li><b>New Features</b></li><ol>";
    v0_40Change += "<li>Established framework and integrate Playbook module.</li>";
    v0_40Change += "<li>Separated Business Unit from filters and changed underlying logic.</li>";
    v0_40Change += "<li>Optimized automatic anchor points placement if missing.</li>";
    v0_40Change += "<li>Clicking on legend will have the option to add competitor price point.</li>";
    v0_40Change += "<li>Enabled manual overwriting of axes range.</li>";
    v0_40Change += "<li>Enabled session resumption when switching among Business Units.</li>";
	v0_40Change += "<li>Browser resolution will now be detected and used for positioning and scaling.</li>";
	v0_40Change += "<li>Extended expiration date to 2014-07-07.</li>";
	v0_40Change += "</ol><br/><li><b>Bug Fixes</b></li><ol>";
	v0_40Change += "<li>Fixed a bug causing inconsistent colors for same category when too many categories are visualized.</li>";
	v0_40Change += "</ol><br/><li><b>UI Changes</b></li><ol>";
    v0_40Change += "<li>Added &quot;Refresh&quot; button.</li>";
    v0_40Change += "<li>Increased opacity of mouseover tooltips so that cross-hair won't interfere.</li>";
    v0_40Change += "<li>Refined cross-hair area during mouse movement on x and y axes.</li>";
    v0_40Change += "<li>Clicking on a grid line will highlight it and gray out the rest.</li>";
    v0_40Change += "</ol></ul></div>";

    var v0_30Change = "<h4>v0.3</h4><div><ul>";
	v0_30Change += "<li><b>New Features</b></li><ol>";
    v0_30Change += "<li>Enabled addition of new grid point by clicking on legend.</li>";
    v0_30Change += "<li>Enabled addition of competitor price after adding customer ask price.</li>";
    v0_30Change += "<li>Enabled crosshairs with current coordinates when moving mouse in grid.</li>";
	v0_30Change += "<li>Extended expiration date to 2014-06-24.</li>";
	v0_30Change += "</ol><br/><li><b>UI Changes</b></li><ol>";
    v0_30Change += "<li>Rescaled grid to [100, 100Billion].</li>";
    v0_30Change += "<li>Filters will now show in tooltip options.</li>";
    v0_30Change += "<li>Added &quot;selectAll&quot; checkbox for all filters.</li>";
    v0_30Change += "</ol></ul></div>";

    var v0_20Change = "<h4>v0.2</h4><div><ul>";
	v0_20Change += "<li><b>New Features</b></li><ol>";
    v0_20Change += "<li>Enabled customer filter feature to view selected customers.</li>";
    v0_20Change += "<li>Enabled &quot;Click All&quot; button for all customers.</li>";
    v0_20Change += "<li>Enabled addition of ask price by clicking on legend.</li>";
    v0_20Change += "<li>Added support for missing discount slope and anchor points in data.</li>";
	v0_20Change += "<li>Added support for typo and out-of-bound ranges in input boxes.</li>";
	v0_20Change += "<li>Extended expiration date to 2014-06-15.</li>";
	v0_20Change += "</ol><br/><li><b>Bug Fixes</b></li><ol>";
	v0_20Change += "<li>Fixed a bug when no tooltip option is selected, a dot will appear.</li>";
	v0_20Change += "<li>Fixed a bug causing difficulties to click on points.</li>";
	v0_20Change += "<li>Some other minor bug fixes.</li>";
	v0_20Change += "</ol><br/><li><b>UI Changes</b></li><ol>";
    v0_20Change += "<li>Remade &quot;Print&quot; button.</li>";
    v0_20Change += "<li>Added &quot;Change Log&quot; button.</li>";
    v0_20Change += "</ol></ul></div>";

	changeLogText += v0_70Change;
	changeLogText += v0_60Change;
    changeLogText += v0_50Change;
    changeLogText += v0_40Change;
    changeLogText += v0_30Change;
    changeLogText += v0_20Change;
	changeLogText += "</div>";
    var changeLogWindow = window.open("", "_blank", "width=460, height=700", "true");
    changeLogWindow.document.write("<html><title>Change Log</title><head>"); // open tags
    changeLogWindow.document.write("<link rel='stylesheet' type='text/css' href='styles.css'>"); // import default css
    changeLogWindow.document.write("<link rel='stylesheet' type='text/css' href='library/jquery-ui.min.css'>"); // import JQuery UI css
    changeLogWindow.document.write("<script type='text/javascript' src='library/jquery-1.11.0.min.js'></script>"); // import JQuery
    changeLogWindow.document.write("<script type='text/javascript' src='library/jquery-ui.min.js'></script>"); // import JQuery UI js
    changeLogWindow.document.write("</head><body>");
	changeLogWindow.document.write("<button class='buttons' onclick='window.close()'>Close</button><hr/>"); // create close button
    changeLogWindow.document.write(changeLogText);
	changeLogWindow.document.write("<script>$('.log_div').accordion({collapsible: true, heightStyle: 'content'});$('.buttons').button();</script>");
	changeLogWindow.document.write("</body></html>"); // end page
}
