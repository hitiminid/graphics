// var AnimationEnum = Object.freeze ({ none: {}, fade: {} });
var svgCanvas = $(document).ready(setSVGReference);
var outer     = $(document).ready(setOuterReference);
var SVG_WIDTH;
var SVG_HEIGHT;

var START_X;
var START_Y;
var currentXPosition;
var currentYPosition;
var currentDegree = 0;
var currentID     = 0;

$(document).ready(function(){
  $("#createKochButton").click(createKoch);
  $("#clearCanvasButton").click(clearCanvas);
  initialFunction();
})

var clearCanvas = function() {
  $("#board").empty();
  initialFunction();
}

var setSVGReference = function() {
  return document.getElementById("board");
}

var setOuterReference = function() {
  return document.getElementById("board-container");
}

var getColorValue = function() {
  var color = $("#koch-color-input").val().toLowerCase();
  switch (color) {
    case "red":
      return "#ff0000";
    case "green":
      return "#008000";
    case "blue":
      return "#0000ff";
    case "purple":
      return "#800080";
    case "orange":
      return "#ffa500";
    case "pink":
      return "#ffc0cb";
    case "yellow":
      return "#ffff00";
    default:
      return color;
  }
}

var getAnimationValue = function() {
  return $("#animations-select").val();
}

var getLevelValue = function() {
  return $("#koch-level-input").val();
}

var getLengthValue = function() {
  return $("#koch-length-input").val();
}

var initialFunction = function () {
  SVG_WIDTH  = 1600;
  SVG_HEIGHT = 900;

  START_X = SVG_WIDTH  / 2;
  START_Y = SVG_HEIGHT;
  // START_Y = SVG_HEIGHT / 2;
  currentXPosition = START_X;
  currentYPosition = START_Y;
}

var getKochLevel = function() {
  var level = parseFloat(getLevelValue());
  if (isNaN(level)) {
    level = 2;
  }
  return level;
}

var getKochLength = function() {
  var length = parseFloat(getLengthValue());
  if (isNaN(length)) {
    length = 50;
  }
  return length;
}

var createKoch = function() {
  var kochLength = getKochLength();
  var kochLevel  = getKochLevel();
  koch(kochLevel, kochLength);
  refreshSVG();
}

var toRadians = function(angle) {
  return angle * (Math.PI / 180);
}

var createStrokeColor = function() {
  var color = getColorValue();
  if (color == "") {
    color = "#000000";
  }
  return "stroke='" + color + "'";
}

var getRandomChaosStyle = function() {
  var styleNumber = Math.floor(Math.random() * (3- 1+ 1)) + 1;
  switch (styleNumber) {
    case 1:
      return "class= 'rainbow1'";
    case 2:
      return "class= 'rainbow2'";
    case 3:
      return "class= 'rainbow3'";
  }
}

var createLine = function (value) {
  var strokeColor = createStrokeColor();
  var strokeWidth = "stroke-width='2'";
  var strokeStyle = strokeColor + " " + strokeWidth;
  var startX      = currentXPosition;
  var startY      = currentYPosition;
  computeEndValues(value);
  var lineID = "line" + currentID;
  var animationClass = "";

  if (getAnimationValue() === "fade") {
    animationClass = "class= 'fade'";
  } else if (getAnimationValue() === "rainbow") {
    animationClass = "class= 'rainbow'";
  } else if (getAnimationValue() === "chaos") {
    animationClass = getRandomChaosStyle();
  }

  $("#board").append("<line " + animationClass + " id='" + lineID + "' " + strokeStyle + " x1='" + startX + "' y1='" + startY + "' x2='" + currentXPosition+"' y2='" + currentYPosition+"' />");

  // if (getAnimationValue() === "fade") {
  //   $("#board").append("<animate xlink:href='#" + lineID + "' attributeName='opacity' from='0' to='1' dur='2s'/>");
  // }
  //  else if (getAnimationValue() === "fade") {
  //   $("#board").append("<animate xlink:href='#" + lineID + "' attributeName='opacity' from='0' to='1' dur='2s'/>");
  // }
  // $("#board").append("<animate xlink:href='#"+ lineID+"' attributeName='fill' values='red;green;blue' dur='2s' repeatCount='indefinite' />");
  currentID++;
  refreshSVG();
}

var computeEndValues = function (value) {
  if (currentDegree === 0) {
    currentYPosition -= value;

  } else if (currentDegree > 0 && currentDegree < 90) {
    angle = 90 - currentDegree;
    var xTranslation = value * Math.cos(toRadians(angle));
    var yTranslation = value * Math.sin(toRadians(angle));
    currentXPosition += Math.abs(xTranslation);
    currentYPosition -= Math.abs(yTranslation);

  } else if (currentDegree === 90) {
    currentXPosition += value;

  } else if (currentDegree > 90 && currentDegree < 180) {
      angle = currentDegree - 90;
      var xTranslation = value * Math.cos(toRadians(angle));
      var yTranslation = value * Math.sin(toRadians(angle));
      currentXPosition += Math.abs(xTranslation);
      currentYPosition += Math.abs(yTranslation);

  } else if (currentDegree === 180) {
    currentYPosition += value;

  } else if (currentDegree > 180 && currentDegree < 270) {
    angle = currentDegree - 180;
    var xTranslation = value * Math.sin(toRadians(angle));
    var yTranslation = value * Math.cos(toRadians(angle));
    currentXPosition -= Math.abs(xTranslation);
    currentYPosition += Math.abs(yTranslation);

  } else if (currentDegree === 270) {
    currentXPosition -= value;

  } else if (currentDegree > 270 && currentDegree < 360) {
    angle = currentDegree - 270;
    var xTranslation = value * Math.cos(toRadians(angle));
    var yTranslation = value * Math.sin(toRadians(angle));
    currentXPosition -= Math.abs(xTranslation);
    currentYPosition -= Math.abs(yTranslation);
  }
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
