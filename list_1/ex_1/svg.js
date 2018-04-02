var svgCanvas = $(document).ready(setSVGReference);
var SVG_WIDTH;
var SVG_HEIGHT;

var START_X;
var START_Y;
var CURRENT_X = START_X;
var CURRENT_Y = START_Y;
var currentDegree = 0;

$(document).ready();

$(document).ready(function(){
  $("#createKochButton").click(createKoch);
  initialFunction();
})

var setSVGReference = function () {
  return document.getElementById("board");
}

var initialFunction = function () {
  // var SVGBox = svgCanvas.getBoundingClientRect();
  SVG_WIDTH  = 1600;
  SVG_HEIGHT = 900;

  START_X = SVG_WIDTH  / 2;
  START_Y = SVG_HEIGHT / 2;
}

var createKoch = function () {
  // console.log(SVG_WIDTH);
  // console.log(SVG_HEIGHT);
  createLine();
}

var createLine = function (size) {
  var strokeStyle = "style='stroke:rgb(255,0,0);stroke-width:2'";
  var startArray  = computeStartValues();
  var endArray    = computeEndValues();
  // $("#board").append("<line " + strokeStyle +" x1='0' y1='0' x2='200' y2='200'  />")
  // refreshSVG();
  performRotation(30)
}

var computeStartValues = function () {
}

var computeEndValues   = function () {
}

var refreshSVG = function () {
  $("#board-container").html($("#board-container").html());
}

var performRotation = function(degree) {
  currentDegree += degree;
  if (currentDegree <= 0) {
    while (currentDegree < 0) {
      currentDegree += 360;
    }
  } else if (currentDegree >= 360){
    while (currentDegree >= 360) {
      currentDegree -= 360;
    }
  }
  console.log(currentDegree);
}

var koch = function(n, size) {
  if (n == 0) {
    createLine(size);
  } else {
    koch(n-1, size);
    performRotation(-60.0);
    koch(n-1, size);
    performRotation(120.0);
    koch(n-1, size);
    performRotation(-60.0);
    koch(n-1, size);
  }
}
