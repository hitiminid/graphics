var sin     = Math.sin;
var cos     = Math.cos;
var bgColor = "#F1F1F1";

/*
todo:
[]  TODO: bugi w poruszaniu po skosie
[]  TODO: skala
[]  TODO: wyswietl zółwia
[]  TODO: krzywa kocha
*/

$(document).ready(function() {
  var commandCounter       = 0;
  var sendButton           = document.getElementById("send-button");
  var inputField           = document.getElementById("input-field");
  var board                = document.getElementById("board");
  var context              = board.getContext("2d");
  var singleCommandsArray  = ["clear", "help", "start"];
  var doubleCommandsArray  = ["forward", "backward", "left", "right", "color", "background"];
  var tripleCommandsArray  = ["move", "square", "circle", "triangle", "koch"];
  var strokeColor          = "#000";
  var shapesArray          = ["square", "circle", "triangle"];

  // var CANVAS_HEIGHT  = 5000;
  var CANVAS_HEIGHT  = board.height;
  // console.log(CANVAS_HEIGHT)
  // var CANVAS_WIDTH   = 5000;
  var CANVAS_WIDTH   = board.width;
  // console.log(CANVAS_WIDTH)
  var INITIAL_X_VALUE = CANVAS_WIDTH / 2;
  var INITIAL_Y_VALUE = CANVAS_HEIGHT / 2;
  var NUMBERS_REGEX   = /^[0-9,.]*$/;
  var HEX_COLOR_REGEX = /#[0-9a-f]{6}|#[0-9a-f]{3}/gi;

  var currentXPosition = INITIAL_X_VALUE;
  var currentYPosition = INITIAL_Y_VALUE;
  var currentAngle     = 0.0;
  var MINIMUM_X = 0;
  var MINIMUM_Y = 0

  var MAXIMUM_X = 2500;
  var MAXIMUM_Y = 2500;

  initialActions();

  function initialActions() {
    context.moveTo(INITIAL_X_VALUE, INITIAL_Y_VALUE);
    console.log(currentXPosition, currentYPosition);
    // alert('moved to initial place');
  }

  $("#send-button").bind( "click", function(event) {
    performInputAction(inputField);
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
          console.log(value2);
        }
      }
      addTextAndClearInput();
      keepCommandListScrolledOnNewInput();
      interpretCommand(command, value, value2);
    }
  }

  function keepCommandListScrolledOnNewInput() {
    $('#commands-list').scrollTop($('#commands-list')[0].scrollHeight);
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
      //TODO: check whether move values are correct
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
    }
  }

  function move(xValue, yValue) {
    currentXPosition = computeX(xValue);
    currentYPosition = computeY(yValue);
    context.moveTo(currentXPosition, currentYPosition);
    createCircle(10, "#008800");
  }

  function moveAndDraw(value) {
    createCircle(10, "#008800");

    oldX = currentXPosition;
    oldY = currentYPosition;

    if (currentAngle === 0) {
      // value = CANVAS_HEIGHT - computeY(value);
      // value = CANVAS_HEIGHT - value;
      currentYPosition -= value;

    } else if (currentAngle > 0 && currentAngle < 90) {

      // console.log(currentAngle)
      angle = currentAngle;
      // var xTranslation = value * cos(currentAngle);
      // var yTranslation = value * sin(currentAngle);

      var xTranslation = value * Math.sin(toRadians(angle));
      var yTranslation = value * Math.cos(toRadians(angle));

      currentXPosition += Math.abs(xTranslation);
      currentYPosition -= Math.abs(yTranslation);

    } else if (currentAngle === 90) {

      // value = computeX(value);
      // value = (value);

      currentXPosition += value;

    } else if (currentAngle > 90 && currentAngle < 180) {

        angle = currentAngle - 90;
        console.log("(90,180)",currentAngle)
        // var xTranslation = value * Math.sin(currentAngle);
        // var yTranslation = value * cos(currentAngle);

        var xTranslation = value * Math.cos(toRadians(angle));
        var yTranslation = value * Math.sin(toRadians(angle));

        currentXPosition += Math.abs(xTranslation);
        currentYPosition += Math.abs(yTranslation);
        console.log("x", xTranslation, "y", yTranslation)

    } else if (currentAngle === 180) {

      // value = CANVAS_HEIGHT - computeY(value);
      // value = CANVAS_HEIGHT - value;

      currentYPosition += value;

    } else if (currentAngle > 180 && currentAngle < 270) {
      angle = currentAngle - 180;

      // var xTranslation = value * cos(currentAngle);
      // var yTranslation = value * sin(currentAngle);
      // console.log(toRadians(30)),
      // console.log()
      var xTranslation = value * Math.sin(toRadians(angle));
      var yTranslation = value * Math.cos(toRadians(angle));

      console.log("x translate =", xTranslation, "y translate =", yTranslation)
      currentXPosition -= Math.abs(xTranslation);
      currentYPosition += Math.abs(yTranslation);

    } else if (currentAngle === 270) {

      // value = computeX(value);
      currentXPosition -= value;

    } else if (currentAngle > 270 && currentAngle < 360) {

      angle = currentAngle - 270;
      // var xTranslation = value * sin(currentAngle);
      // var yTranslation = value * cos(currentAngle);
      //TODO: probably wrong :/
      var xTranslation = value * Math.cos(toRadians(angle));
      var yTranslation = value * Math.sin(toRadians(angle));

      currentXPosition -= Math.abs(xTranslation);
      currentYPosition -= Math.abs(yTranslation);

    }
    //TODO: check a case when bounds are exceeded

    currentXPosition = checkIfBoundsAreExceeded(currentXPosition, CANVAS_WIDTH);
    currentYPosition = checkIfBoundsAreExceeded(currentYPosition, CANVAS_HEIGHT);

    // console.log(currentXPosition, currentYPosition)
    // currentXPosition = computeX(currentXPosition)
    // currentYPosition = computeY(currentYPosition)
    // console.log("after", currentXPosition, currentYPosition)

    console.log("from", oldX, oldY);
    console.log("to",   currentXPosition, currentYPosition);

    context.beginPath();
    context.moveTo(oldX, oldY);
    context.lineTo(currentXPosition, currentYPosition);
    context.stroke();
    context.closePath();
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
    var guide = "1. To move forward use 'forward [value]' <br>2. To move backward use 'backward [value]'<br>3. To rotate clockwise use 'right [value]', <br>counter clockwise - 'left [value]'."
    $("#commands-list").append("<p>" + guide + "</p>")
  }

  function computeX(x) {
    return (x-MINIMUM_X) / (MAXIMUM_X-MINIMUM_X)*(CANVAS_WIDTH);
  }

  function computeY(y) {
    return CANVAS_HEIGHT-(y-MINIMUM_Y)/(MAXIMUM_Y-MINIMUM_Y)*(CANVAS_HEIGHT);
  }

  function clearScreen(context, bgColorString) {
    context.globalCompositeOperation ="source-over";
    context.fillStyle = bgColorString;
    context.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // here it will be passed as a -90 or 90 depending on a fact whether we use right or left
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
    console.log("currentAngle", currentAngle)
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
    console.log("hex", colorHexValue);
    changeStrokeColor(colorHexValue.toString(), false);
    context.beginPath();
    context.arc(currentXPosition, currentYPosition, radius, 0 , 2*Math.PI);
    context.stroke();
    context.closePath();
    changeStrokeColor(strokeColor, true);
  }

  function createTriangle(value, colorHexValue) {
    changeStrokeColor(colorHexValue, false)
    moveAndDraw(value);
    computeAngle(90);
    moveAndDraw(value);
    computeAngle(170);
    moveAndDraw(value * Math.sqrt(2));
    computeAngle(135);
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
    changeStrokeColor(strokeColor, true);
  }

  function createRectangle() {
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
});
