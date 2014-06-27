var currentDate = new Date();
var expirationDate = new Date("2014-07-07");
if (currentDate >= expirationDate) {
    $("body").empty();
	$("body").html("<h1 id=contact_author><a href='mailto:cui.bo@bcg.com?Subject=Pricing Grid Visualization Bug' target='_top'>Contact Author</a>");
    $.alert("Version expired!\n\nContact author for updated version!");
}

