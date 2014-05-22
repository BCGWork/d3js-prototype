var currentDate = new Date();
var expirationDate = new Date("2014-06-07");
if (currentDate >= expirationDate) {
    $("#title").remove();
    $("#user_inputs").remove();
    $("#control_panel").remove();
    $("#data_visualization").remove();
    alert("Version expired!\n\nContact author for updated version!");
    $("#contact_author").css("font-size", 20);
}