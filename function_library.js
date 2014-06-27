// Resize window event listener
$(window).resize(function () {
    rawDataObject.width = $(window).width() * 0.79 - rawDataObject.margin.left - rawDataObject.margin.right;
    rawDataObject.height = $(window).height() * 0.77 - rawDataObject.margin.top - rawDataObject.margin.bottom;
    updateAllSvg();
});

// Click outside foreignObject will hide it
/*
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
    var width = $("svg").attr("width"), // get svg width
        height = $("svg").attr("height"), // get svg height
        gridContent = $("svg").html(), // get svg content
        printWindow = window.open(); // open new window
    printWindow.document.write("<html><title>Grid Visualization</title><head>"); // open tags
    printWindow.document.write("<link rel='icon' type='image/x-icon' href='magic_wand.ico'>"); // import icon
    printWindow.document.write("<link rel='stylesheet' type='text/css' href='styles.css'>"); // import default css
    printWindow.document.write("<link rel='stylesheet' type='text/css' href='library/jquery-ui-1.10.4.custom.min.css'>"); // import JQuery UI css
    printWindow.document.write("<script type='text/javascript' src='library/jquery-1.11.0.min.js'></script>"); // import JQuery
    printWindow.document.write("<script type='text/javascript' src='library/jquery-ui-1.10.4.custom.min.js'></script>"); // import JQuery UI js
    printWindow.document.write("</head><body>");
    printWindow.document.write("<button class='buttons' onclick='window.print()'>Print</button>"); // create print button
    printWindow.document.write("<button class='buttons' onclick='window.close()'>Close</button><hr/>"); // create close button
    printWindow.document.write("<svg width=" + width + " height=" + height + ">"); // initialize svg according to existing width and height
    printWindow.document.write(gridContent); // reproduce svg content
    printWindow.document.write("</svg>");
    printWindow.document.write("<script type='text/javascript' src='jui_style.js'></script>"); // Trigger JQuery UI styling
    printWindow.document.write("</body></html>"); // end page
}

// Log user activity
function logOutput() {
    var data = rawDataObject.currentData;
    // Take snapshot of current settings
    for (var i = 0; i < data.length; i++) {
        var tempLog = [];
        for (var key in data[i]) {
            if ((key != "Category") && (key != "AnchorPerGB")) {
                tempLog.push(data[i][key]);
            }
        }
        rawDataObject.userLog = rawDataObject.userLog.concat(tempLog.toString() + "\n");
    }

    // Set log status in div
    $("#log_status").html("<font color='#cd5c0a'>Data Saved!</font>").show();
    setTimeout(function () {
        $("#log_status").fadeOut("slow");
    }, 800);
}

// Export output to text file
function exportToText() {
    var textToExport = new Blob([rawDataObject.userLog], {
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

    $("#choose_x").val(storageNames[0]);
    $("#choose_y").val(storageNames[1]);
    $("#input_xmin").val(storageAxesRange[0]);
    $("#input_xmax").val(storageAxesRange[1]);
    $("#input_ymin").val(storageAxesRange[2]);
    $("#input_ymax").val(storageAxesRange[3]);
    $(".checkbox").each(function (i) {
        $.inArray(i, storageFilters) > -1 ? this.checked = true : this.checked = false;
    });
    $(".tooltip_display").each(function (i) {
        $.inArray(i, storageTooltips) > -1 ? this.checked = true : this.checked = false;
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
    if ((typeof (rawDataObject.currentData) != "undefined") & (rawDataObject.currentData.length > 0) & ($("#choose_x_pb").val() !== null) & ($("#choose_y_pb").val() !== null)) {
        createPbCategory(rawDataObject.currentData);
        createPlaybook();
    }
}

// Add change log button
function changeLog() {
    var changeLogText = "<h3>Version Log</h3>";

    var v0_50Change = "<h4><u>v0.5</u></h4><ol>";
	v0_50Change += "<li>Applied new theme to entire tool and reformatted most layout.</li>";
	v0_50Change += "<li>Added animation for some sections when entering and leaving.</li>";
	v0_50Change += "<li>New points (ask price, competitor price, grid point) will be memorized and resumed when detected. Right-click removes them completely.</li>";
	v0_50Change += "<li>Enabled automatic formatting for all input text boxes.</li>";
	v0_50Change += "<li>Remade all input text boxes.</li>";
    v0_50Change += "<li>Added drop down menu to adjust circle size for playbook.</li>";
    v0_50Change += "<li>Removed confirmation window, so that sessions will be automatically resumed when switching among business units.</li>";
    v0_50Change += "<li>Fixed a bug causing svg to move outside visualization panel when resizing window.</li>";
	v0_50Change += "<li>Some other minor bug fixes and code clean up.</li>"
    v0_50Change += "</ol>";

    var v0_40Change = "<h4><u>v0.4</u></h4><ol>";
    v0_40Change += "<li>Established framework and integrate Playbook module.</li>";
    v0_40Change += "<li>Separated Business Unit from filters and changed underlying logic.</li>";
    v0_40Change += "<li>Optimized automatic anchor points placement if missing.</li>";
    v0_40Change += "<li>Clicking on legend will have the option to add competitor price point.</li>";
    v0_40Change += "<li>Enabled manual overwriting of axes range.</li>";
    v0_40Change += "<li>Enabled session resumption when switching among Business Units.</li>";
    v0_40Change += "<li>Fixed a bug causing inconsistent colors for same category when too many categories are visualized.</li>";
    v0_40Change += "<li>Added &quot;Refresh&quot; button.</li>";
    v0_40Change += "<li>Increased opacity of mouseover tooltips so that cross-hair won't interfere.</li>";
    v0_40Change += "<li>Refined cross-hair area during mouse movement on x and y axes.</li>";
    v0_40Change += "<li>Browser resolution will now be detected and used for positioning and scaling.</li>";
    v0_40Change += "<li>Clicking on a grid line will highlight it and gray out the rest.</li>";
    v0_40Change += "<li>Extended expiration date to 2014-07-07.</li>";
    v0_40Change += "</ol>";

    var v0_30Change = "<h4><u>v0.3</u></h4><ol>";
    v0_30Change += "<li>Enabled addition of new grid point by clicking on legend.</li>";
    v0_30Change += "<li>Enabled addition of competitor price after adding customer ask price.</li>";
    v0_30Change += "<li>Rescaled grid to [100, 100Billion].</li>";
    v0_30Change += "<li>Enabled crosshairs with current coordinates when moving mouse in grid.</li>";
    v0_30Change += "<li>Filters will now show in tooltip options.</li>";
    v0_30Change += "<li>Added &quot;selectAll&quot; checkbox for all filters.</li>";
    v0_30Change += "<li>Extended expiration date to 2014-06-24.</li>";
    v0_30Change += "</ol>";

    var v0_20Change = "<h4><u>v0.2</u></h4><ol>";
    v0_20Change += "<li>Enabled customer filter feature to view selected customers.</li>";
    v0_20Change += "<li>Enabled &quot;Click All&quot; button for all customers.</li>";
    v0_20Change += "<li>Enabled addition of ask price by clicking on legend.</li>";
    v0_20Change += "<li>Added support for missing discount slope and anchor points in data.</li>";
    v0_20Change += "<li>Remade &quot;Print&quot; button.</li>";
    v0_20Change += "<li>Fixed a bug when no tooltip option is selected, a dot will appear.</li>";
    v0_20Change += "<li>Added support for typo and out-of-bound ranges in input boxes.</li>";
    v0_20Change += "<li>Fixed a bug causing difficulties to click on points.</li>";
    v0_20Change += "<li>Added &quot;Change Log&quot; button.</li>";
    v0_20Change += "<li>Extended expiration date to 2014-06-15.</li>";
    v0_20Change += "<li>Some other minor bug fixes.</li>";
    v0_20Change += "</ol>";

    changeLogText += v0_50Change;
    changeLogText += v0_40Change;
    changeLogText += v0_30Change;
    changeLogText += v0_20Change;
    var changeLogWindow = window.open("", "MsgWindow", "width=400, height=600");
    changeLogWindow.document.write(changeLogText);
}