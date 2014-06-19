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
/*
// Duplicate grid and open in new tab
function clonePage() {
	var head = $("head").html(),
		body = $("body").html(),
		newWindow = window.open();
	newWindow.document.write("<html><head>");
	newWindow.document.write(head + "</head><body>");
	newWindow.document.write(body + "</body>");
	newWindow.document.write("</html>");
}
*/
// Print grid windows
function printGrid() {
    var width = $("svg").attr("width"), // get svg width
        height = $("svg").attr("height"), // get svg height
        gridContent = $("svg").html(), // get svg content
        printWindow = window.open(); // open new window
    printWindow.document.write("<html><title>Grid Visualization</title><head><link rel='stylesheet' type='text/css' href='styles.css'></link></head><body>"); // initialize and import css settings
    printWindow.document.write("<button onclick='window.print()'>Print</button>"); // create print button
    printWindow.document.write("<button onclick='window.close()'>Close</button><hr/>"); // create close button
    printWindow.document.write("<svg width=" + width + " height=" + height + ">"); // initialize svg according to existing width and height
    printWindow.document.write(gridContent); // reproduce svg content
    printWindow.document.write("</svg></body></html>"); // end page
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
    $("#log_status").html("Data Saved!").show();
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

// Add change log button
function changeLog() {
	var changeLogText = "<h3>Change Log</h3>";

	var v0_40Change = "<h4><u>v0.4</u></h4><ol>";
	v0_40Change += "<li>Established framework to integrate Playbook module.</li>";
	v0_40Change += "<li>Separated Business Unit from filters and changed underlying logic.</li>";
	v0_40Change += "<li>Optimized automatic anchor points placement if missing.</li>";
	v0_40Change += "<li>Fixed a bug causing inconsistent colors for same category when too many categories are visualized.</li>";
	v0_40Change += "<li>Added &quot;Refresh&quot; button.</li>";
	v0_40Change += "<li>Increased opacity of mouseover tooltips so that cross-hair won't interfere.</li>";
	v0_40Change += "<li>Refined cross-hair area during mouse movement on x and y axes.</li>";
	v0_40Change += "<li>Browser resolution will now be detected and used for positioning and scaling.</li>";
	v0_40Change += "<li>Clicking on a grid line will highlight it and gray out the rest.</li>";
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

	changeLogText += v0_40Change;
	changeLogText += v0_30Change;
	changeLogText += v0_20Change;
	var changeLogWindow = window.open("", "MsgWindow", "width=400, height=600");
	changeLogWindow.document.write(changeLogText);
}
