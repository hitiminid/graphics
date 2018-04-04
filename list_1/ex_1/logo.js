var sin     = Math.sin;
var cos     = Math.cos;
var bgColor = "#F1F1F1";

/*
todo:
[]  TODO: skala
[]  TODO: wyswietl zółwia
*/

$(document).ready(function() {
  var commandCounter       = 0;
  var pointer              = document.getElementById("turtle");
  var sendButton           = document.getElementById("send-button");
  var inputField           = document.getElementById("input-field");
  var board                = document.getElementById("board");
  var context              = board.getContext("2d");
  var singleCommandsArray  = ["clear", "help", "start", "bounds"];
  var doubleCommandsArray  = ["forward", "backward", "left", "right", "color", "background"];
  var tripleCommandsArray  = ["move", "square", "circle", "triangle", "koch"];
  var strokeColor          = "#000";
  var shapesArray          = ["square", "circle", "triangle"];
  var boundsExceededCorrection = true;

  var CANVAS_HEIGHT  = board.height;
  var CANVAS_WIDTH   = board.width;
  var VIRTUAL_WIDTH  = 2500;
  var Y_CENTER;
  var SCALE_RATIO;
  var INITIAL_X_VALUE = CANVAS_WIDTH / 2;
  var INITIAL_Y_VALUE = CANVAS_HEIGHT / 2;
  var NUMBERS_REGEX   = /^[0-9,.]*$/;
  var HEX_COLOR_REGEX = /#[0-9a-f]{6}|#[0-9a-f]{3}/gi;

  var currentXPosition;//= computeX(INITIAL_X_VALUE);
  var currentYPosition; //= computeY(INITIAL_Y_VALUE);
  var oldX            ;// = currentXPosition;
  var oldY            ; //= currentYPosition;
  var currentAngle     = 0.0;
  var MINIMUM_X = 0;
  var MINIMUM_Y = 0

  var MAXIMUM_X = 16000;
  var MAXIMUM_Y = 9000;

  initialActions();

  function initialActions() {
    currentXPosition = MAXIMUM_X / 2;
    currentYPosition = MAXIMUM_Y / 2;
    oldX             = currentXPosition;
    oldY             = currentYPosition;
    context.moveTo(computeX(currentXPosition), computeY(currentYPosition));
    SCALE_RATIO      = board.width / 2500;
    Y_CENTER         = board.height / 2;
    createCircle(100, "#008800")
    // currentXPosition = xRealToVirtual(INITIAL_X_VALUE);
    // currentYPosition = yRealToVirtual(INITIAL_Y_VALUE);
    // oldX             = currentXPosition;
    // oldY             = currentYPosition;

  }

  $("#send-button").bind( "click", function(event) {
    performInputAction(inputField);
  });

  $("#debug").bind( "click", function(event) {
    var x = 2000;
    var newX = computeX(x);
    console.log(newX);

    var y = 2000;
    var newY = computeY(y);
    console.log(newY);
  });

  $('#input-field').keypress(function (event) {
    if (event.which == 13) {
      event.preventDefault();
      performInputAction(inputField);
    }
  });

  function performInputAction(inputField) {
    var input = inputField.value.toLowerCase();
    if (validateInput(input)) {
      var commandElements = filterArrayFromWhiteSpaces((input).split(" "));
      var command = commandElements[0];
      var value  = null;
      var value2 = null;

      if (command === "color" || command === "background") { //the only command that requires string as a parameter is color (color "F1F1F1")
        value = commandElements[1];
      } else if (contains(shapesArray, command)) {
        value  = commandElements[1];
        value2 = commandElements[2].toString();
      } else {
        value   = parseFloat(commandElements[1]);
        if (command == "move" || command == "koch") {
          value2 = parseFloat(commandElements[2]);
        }
      }
      addTextAndClearInput();
      keepCommandListScrolledOnNewInput();
      interpretCommand(command, value, value2);
    }
  }

  function keepCommandListScrolledOnNewInput() {
    if ($('#commands-list').length > 0) {
      $('#commands-list').scrollTop($('#commands-list')[0].scrollHeight);
    }
  }

  function addTextAndClearInput() {
    if (inputField.value !== "") {
      commandCounter++;
      $("#commands-list").append("<p> #" + commandCounter + ": "+ inputField.value +"</p>")
      inputField.value = ""
    }
  }

  function validateInput(input) {
    var inputParts = input.split(" ");
    inputParts = filterArrayFromWhiteSpaces(inputParts);
    var command = inputParts[0];
    var valueRegex;

    if (command !== "color" && command !== "background" && command !== "circle" && command !== "square" && command !== "rectangle") {
      valueRegex = NUMBERS_REGEX;
    } else {
      valueRegex = HEX_COLOR_REGEX;
    }

    var isValidValue = valueRegex.test(inputParts[1]);
    var colorValueValidation;
    if (shapesArray.includes(command)) {
      colorValueValidation = valueRegex.test(inputParts[2]);
    }

    if (singleCommandsArray.includes(command) && inputParts.length == 1) {
      return true;
    } else if (doubleCommandsArray.includes(command) && inputParts.length == 2 && (isValidValue || command =="koch")) {
      return true;
    } else if (tripleCommandsArray.includes(command) && inputParts.length == 3) {
      if (contains(shapesArray, command) && !colorValueValidation) {
        return false;
      }
      return true;
    } else {
      return false;
    }
  }

  function interpretCommand(command, value, value2) {

    oldX = currentXPosition;
    oldY = currentYPosition;

    switch(command) {

      case "move":
        move(value, value2)
      break;

      case "forward":
          moveAndDraw(value);
      break;

      case "backward":
          moveAndDraw(-value);
      break;

      case "right":
        computeAngle(value);
      break;

      case "left":
        computeAngle(-value)
      break;

      case "clear":
        clearScreen(context, bgColor);
      break;

      case "help":
        showHelp();
      break;

      case "koch":
        koch(value, value2);
      break;

      case "start":
        start();
      break;

      case "color":
        changeStrokeColor(value);
      break;

      case "background":
        changeBackgroundColor(value);
      break;

      case "square":
        createSquare(parseFloat(value), value2);
      break;

      case "circle":
        createCircle(parseFloat(value), value2);
      break;

      case "triangle":
        createTriangle(parseFloat(value), value2);
      break;

      case "bounds":
        changeBoundsOption();
        break;
    }
  }

  function move(xValue, yValue) {
    currentXPosition = xValue;
    currentYPosition = yValue;
    var x = computeX(xValue)
    var y = computeY(yValue)
    context.moveTo(x, y);
    // pointer.style = `left: ${currentXPosition}px; top: ${currentYPosition}  px;`;
    createCircle(100, "#008800");
  }

  function moveAndDraw(value) {
    // createCircle(10, "#008800");
    oldX = currentXPosition;
    oldY = currentYPosition;

    if (currentAngle === 0) {

      currentYPosition -= value;
      // currentYPosition = currentYPosition)

    } else if (currentAngle > 0 && currentAngle < 90) {

      angle = 90 - currentAngle;
      var xTranslation =  value * Math.cos(toRadians(angle));
      var yTranslation =  value * Math.sin(toRadians(angle));
      currentXPosition += Math.abs(xTranslation);
      currentYPosition -= Math.abs(yTranslation);

    } else if (currentAngle === 90) {

      currentXPosition += value;

    } else if (currentAngle > 90 && currentAngle < 180) {

        angle = currentAngle - 90;
        var xTranslation =  value * Math.cos(toRadians(angle));
        var yTranslation =  value * Math.sin(toRadians(angle));
        currentXPosition += Math.abs(xTranslation);
        currentYPosition += Math.abs(yTranslation);

    } else if (currentAngle === 180) {

      currentYPosition += value;

    } else if (currentAngle > 180 && currentAngle < 270) {

      angle = currentAngle - 180;
      var xTranslation =  value * Math.sin(toRadians(angle));
      var yTranslation =  value * Math.cos(toRadians(angle));
      currentXPosition -= Math.abs(xTranslation);
      currentYPosition += Math.abs(yTranslation);

    } else if (currentAngle === 270) {

      currentXPosition -= value;

    } else if (currentAngle > 270 && currentAngle < 360) {

      angle = currentAngle - 270;
      var xTranslation =  value * Math.cos(toRadians(angle));
      var yTranslation =  value * Math.sin(toRadians(angle));
      currentXPosition -= Math.abs(xTranslation);
      currentYPosition -= Math.abs(yTranslation);
    }
    //TODO: check a case when bounds are exceeded
    if (boundsExceededCorrection) {
      currentXPosition = checkIfBoundsAreExceeded(currentXPosition, MAXIMUM_X);
      currentYPosition = checkIfBoundsAreExceeded(currentYPosition, MAXIMUM_Y);
    }

    // currentXPosition = computeX(currentXPosition)
    // currentYPosition = computeY(currentYPosition)

    context.beginPath();
    // var a_oldX = xVirtualToReal(oldX);
    // var a_oldY = yVirtualToReal(oldY);
    var _oldX = computeX(oldX);
    var _oldY = computeY(oldY);
    context.moveTo(_oldX, _oldY);
    // var newX = xVirtualToReal();
    // var newY = yVirtualToReal(currentYPosition);
    context.lineTo(computeX(currentXPosition), computeY(currentYPosition));
    context.stroke();
    context.closePath();
    // pointer.style = `left: ${currentXPosition}px; top: ${currentYPosition}px;`;
  }

  function checkDirectionAndMapMovementValue(value) {
  }

  function checkIfBoundsAreExceeded(value, maxValue) {
    if (value >= maxValue) {
      value = maxValue;
    } else if (value <= 0.0) {
      value = 0.0
    }
    return value;
  }

  function changeStrokeColor(colorHexValue, changeGlobalColor) {
    context.strokeStyle = colorHexValue;
    if (changeGlobalColor) {
      strokeColor = colorHexValue;
    }
  }

  function changeBackgroundColor(colorHexValue) {
    bgColor = colorHexValue;
    context.fillStyle = colorHexValue;
    context.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  function start() {
    context.moveTo(computeX(currentXPosition), computeY(currentYPosition));
  }

  function showHelp() {
    var guide = "1. Forward = 'forward [value]' <br>2. Backward = 'backward [value]'<br>3. Rotate = 'right [value]',<br> Rotate = 'left [value]'."
    $("#commands-list").append("<p>" + guide + "</p>")
  }

  function computeX(x) {
    // return x * (1 / SCALE_RATIO);
    // return x * SCALE_RATIO;
    return (x / MAXIMUM_X)*(CANVAS_WIDTH);
  }

  function xRealToVirtual(x) {
    return (x * (1 / SCALE_RATIO));
  }

  function yRealToVirtual(y) {
    return (y + 2 * (Y_CENTER - y)) * (1 / SCALE_RATIO);
  }

  function xVirtualToReal(x) {
    return x * SCALE_RATIO;
  }

  function yVirtualToReal(y) {
    return ((y * SCALE_RATIO) + 2 * (Y_CENTER) - (y * SCALE_RATIO));
  }

  function computeY(y) {
    return CANVAS_HEIGHT - (y / MAXIMUM_Y)*(CANVAS_HEIGHT);
    // var realY = y * SCALE_RATIO;
    // return (realY + 2 * ((Y_CENTER) - realY));
    // var realY = y * SCALE_RATIO;
    // return (y + 2 * (Y_CENTER - y)) * (1 / SCALE_RATIO)

  }

  function clearScreen(context, bgColorString) {
    context.globalCompositeOperation ="source-over";
    context.fillStyle = bgColorString;
    context.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  function computeAngle(value) {
    currentAngle += value;
    if (currentAngle <= 0) {
      while (currentAngle < 0) {
        currentAngle += 360;
      }
    } else if (currentAngle >= 360){
      while (currentAngle >= 360) {
        currentAngle -= 360;
      }
    }
    $("#commands-list").append("<p>Angle = " + currentAngle +"</p>");
    keepCommandListScrolledOnNewInput();
  }

  function filterArrayFromWhiteSpaces(array) {
    var filteredArray = [];
    for (var i = 0; i < array.length; i++) {
      if (array[i] !== "") {
        filteredArray.push(array[i]);
      }
    }
    return filteredArray;
  }

  function createCircle(radius, colorHexValue) {
    changeStrokeColor(colorHexValue.toString(), false);
    var x      = computeX(currentXPosition);
    var y      = computeY(currentYPosition);
    var radius = computeX(radius);

    context.beginPath();
    context.arc(x, y, radius, 0 , 2*Math.PI);
    context.stroke();
    context.closePath();
    changeStrokeColor(strokeColor, true);
  }

  function createTriangle(value, colorHexValue) {
    changeStrokeColor(colorHexValue, false)
    moveAndDraw(value);
    computeAngle(135);
    moveAndDraw(value * Math.sqrt(2));
    computeAngle(135);
    moveAndDraw(value);
    computeAngle(90);
    changeStrokeColor(strokeColor, true);
  }

  function createSquare(value, colorHexValue) {
    changeStrokeColor(colorHexValue, false)
    moveAndDraw(value);
    computeAngle(90);
    moveAndDraw(value);
    computeAngle(90);
    moveAndDraw(value);
    computeAngle(90);
    moveAndDraw(value);
    computeAngle(90);
    changeStrokeColor(strokeColor, true);
  }

  function createRectangle(value, secondaryValue, colorHexValue) {
    changeStrokeColor(colorHexValue, false)
    moveAndDraw(value);
    computeAngle(90);
    moveAndDraw(secondaryValue);
    computeAngle(90);
    moveAndDraw(value);
    computeAngle(90);
    moveAndDraw(secondaryValue);
    computeAngle(90);
    changeStrokeColor(strokeColor, true);
  }

  function createTrapezoid(value, secondaryValue, colorHexValue) {
    changeStrokeColor(colorHexValue, false)
    computeAngle(90);
    moveAndDraw(value);
    computeAngle(-135);
    moveAndDraw(Math.sqrt(2) * value / 3);
    computeAngle(-45);
    moveAndDraw(value/3);
    computeAngle(-45);
    moveAndDraw(Math.sqrt(2) * value / 3);
    computeAngle(-225);
    changeStrokeColor(strokeColor, true);
  }

  function createParallelogram(value, secondaryValue, colorHexValue) {
    changeStrokeColor(colorHexValue, false)
    computeAngle(30); //right 30
    moveAndDraw(value);
    computeAngle(60);
    moveAndDraw(secondaryValue);
    computeAngle(120);
    moveAndDraw(value);
    computeAngle(60);
    moveAndDraw(secondaryValue);
    computeAngle(90);
    changeStrokeColor(strokeColor, true);
  }

  function createHexagon(value, secondaryValue, colorHexValue) {
    changeStrokeColor(colorHexValue, false)
    computeAngle(60);
    moveAndDraw(value);
    computeAngle(-60);
    moveAndDraw(value);
    computeAngle(-60);
    moveAndDraw(value);
    computeAngle(-60);
    moveAndDraw(value);
    computeAngle(-60);
    moveAndDraw(value);
    computeAngle(-60);
    moveAndDraw(value);
    computeAngle(-120);
    changeStrokeColor(strokeColor, true);
  }

  function createTriforce(value, secondaryValue, colorHexValue) {
    changeStrokeColor(colorHexValue, false)
    computeAngle(90);
    moveAndDraw(2*value);
    computeAngle(-120);
    moveAndDraw(2*value);
    computeAngle(-120);
    moveAndDraw(value);
    computeAngle(-120);
    moveAndDraw(value);
    computeAngle(120);
    moveAndDraw(value);
    computeAngle(120);
    moveAndDraw(value);
    computeAngle(-120);
    moveAndDraw(value);
    computeAngle(-210);
    changeStrokeColor(strokeColor, true);
  }

  function between(number, min, max) {
    return number >= min && number <= max;
  }

  function koch(n, size) {
    if (n == 0) {
      moveAndDraw(size);
    } else {
      koch(n-1, size);
      computeAngle(-60.0);
      koch(n-1, size);
      computeAngle(120.0);
      koch(n-1, size);
      computeAngle(-60.0);
      koch(n-1, size);
    }
  }

  function contains(array, value) {
    var numberOfElements = array.length;
    for (i = 0; i < numberOfElements; i++) {
      if (array[i] === value) {
        return true;
      }
    }
    return false;
  }

  function toDegrees (angle) {
    return angle * (180 / Math.PI);
  }

  function toRadians (angle) {
    return angle * (Math.PI / 180);
  }

  var changeBoundsOption = function() {
    boundsExceededCorrection = !boundsExceededCorrection;
    $("#commands-list").append("<p>BoundsCorrection = " + boundsExceededCorrection +"</p>")
    if ($('#commands-list').length > 0) {
      $('#commands-list').scrollTop($('#commands-list')[0].scrollHeight);
    }
  }

  /****************************************************
                        SHAPES
  *****************************************************/
  var getSelectedShape = function() {
    var shape = $("#shape-select").val();
    return shape;
  }

  var getSelectedColor = function() {
    var color = $("#color-input-field").val();
    return color;
  }

  var getValue = function() {
    var value = $("#value-input-field").val();
    return value;
  }

  var getSecondaryValue = function () {
    var value = $("#value-2nd-input-field").val();
    return value;
  }

  //todo: rectangle multiple values
  function getSelectedValues() {
    clearScreen(context, bgColor);
    var selectedColor  = getSelectedColor();
    var selectedShape  = getSelectedShape();
    var value          = parseFloat(getValue());
    var secondaryValue = parseFloat(getSecondaryValue());

    if (typeof selectedColor === 'undefined') {
      selectedColor = "#000000";
    }
    if (isNaN(value)) {
      value = 500;
    }
    if (isNaN(secondaryValue)) {
      secondaryValue = value * 2;
    }

    switch(selectedShape) {
      case "square":
        createSquare(value, selectedColor);
        break;

      case "rectangle":
        createRectangle(value, secondaryValue, selectedColor);
        break;

      case "triangle":
        createTriangle(value, selectedColor);
        break;

      case "circle":
        createCircle(value, selectedColor);
        break;

      case "trapezoid":
        createTrapezoid(value, secondaryValue, selectedColor);
        break;

      case "parallelogram":
        createParallelogram(value, secondaryValue, selectedColor);
        break;

      case "hexagon":
        createHexagon(value, secondaryValue, selectedColor);
        break;

      case "triforce":
        createTriforce(value, secondaryValue, selectedColor);
        break;
    }
  }
  $("#createShapeButton").click(getSelectedValues);

  /****************************************************
                        KOCH
  *****************************************************/

  var getCanvasKochLevel = function() {
    var level = parseFloat($("#canvas-koch-level").val());
    if (isNaN(level)) {
      level = 2;
    }
    return level;
  }

  var getCanvasKochLength = function() {
    var length = parseFloat($("#canvas-koch-length").val());
    if (isNaN(length)) {
      length = 50;
    }
    return length;
  }

  var getCanvasKochColor = function() {
    var color = ($("#canvas-koch-color").val()).toLowerCase();
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

  var createCanvasKoch = function() {
    //TODO: starting position
    boundsExceededCorrection = false;
    var level  = getCanvasKochLevel();
    var length = getCanvasKochLength();
    var color  = getCanvasKochColor();
    changeStrokeColor(color, false);

    koch(level, length);
  }

  $("#create-canvas-koch").click(createCanvasKoch);
});
