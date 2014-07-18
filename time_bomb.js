var currentDate = new Date();
var expirationDate = new Date("2014-07-25");
if (currentDate >= expirationDate) {
    $("body").empty();
	$("body").html("<a class=buttons href='mailto:cui.bo@bcg.com?Subject=B2B Pricing Suite Bug' target='_top'>Contact Author</a>");
    $.alert("Version expired!\n\nContact author for updated version!");
}

