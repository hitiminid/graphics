$(document).ready(function() {


  var svgCanvas = document.getElementById("board");

  var createKoch = function () {
    console.log(123)
    $("#board").append("<line x1='0' y1='0' x2='200' y2='200' style='stroke:rgb(255,0,0);stroke-width:2' />")
    refreshSVG();
  }

  $("#createKochButton").click(createKoch);

  var refreshSVG = function () {
    $("#board-container").html($("#board-container").html());
  }
});
