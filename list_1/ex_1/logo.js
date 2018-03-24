var sin     = Math.sin;
var cos     = Math.cos;
var bgColor = "#F1F1F1";

/*
todo:
[]  TODO: odwrocone osie - Y rosnie do gory, X w prawo ???
[]  TODO: bugi w poruszaniu po skosie
[]  TODO: skala
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

  var CANVAS_HEIGHT  = board.height;
  var CANVAS_WIDTH   = board.width;
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
    alert('moved to initial place');
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

      if (command === "color" || command === "background") { //the only command that requires string as a parameter is color (color "F1F1F1")
        var value = commandElements[1];
      } else if (contains(shapesArray, command)) {
        var value  = commandElements[1];
        var value2 = commandElements[2].toString();
      } else {
        var value   = parseFloat(commandElements[1]);
        if (command == "move" || command == "koch") {
          var value2 = parseFloat(commandElements[2]);
          console.log(value2);
        } else {
          var value2 = null;
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
    console.log(inputParts.length);

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
      // console.log(123);

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
    console.log("(" + currentXPosition + "," + currentYPosition + ") => (" + xValue + "," + yValue + ")");

    currentXPosition = xValue;
    currentYPosition = 900 - yValue;


    context.moveTo(xValue, 900 - yValue);
  }

  function moveAndDraw(value) {

    oldX = currentXPosition;
    oldY = currentYPosition;
    if (currentAngle === 0) {

      currentXPosition =  currentXPosition;
      currentYPosition -= value;

    } else if (currentAngle > 0 && currentAngle < 90) {

      var xTranslation = value * cos(currentAngle);
      var yTranslation = value * sin(currentAngle);
      currentXPosition += Math.abs(xTranslation);
      currentYPosition -= Math.abs(yTranslation);

    } else if (currentAngle === 90) {

      currentXPosition += value;

    } else if (currentAngle > 90 && currentAngle < 180) {
        var xTranslation = value * cos(currentAngle);
        var yTranslation = value * sin(currentAngle);
        currentXPosition += Math.abs(xTranslation);
        currentYPosition += Math.abs(yTranslation);

    } else if (currentAngle === 180) {

      currentYPosition += value;

    } else if (currentAngle > 180 && currentAngle < 270) {

      var xTranslation = value * cos(currentAngle);
      var yTranslation = value * sin(currentAngle);
      currentXPosition -= Math.abs(xTranslation);
      currentYPosition += Math.abs(yTranslation);

    } else if (currentAngle === 270) {

      currentXPosition -= value ;

    } else if (currentAngle > 270 && currentAngle < 360) {

      var xTranslation = value * cos(currentAngle);
      var yTranslation = value * sin(currentAngle);
      currentXPosition -= Math.abs(xTranslation);
      currentYPosition -= Math.abs(yTranslation);

    }

    currentXPosition = checkIfBoundsAreExceeded(currentXPosition, CANVAS_WIDTH);
    currentYPosition = checkIfBoundsAreExceeded(currentYPosition, CANVAS_HEIGHT);

    context.beginPath();
    context.moveTo(oldX, oldY);
    context.lineTo(currentXPosition, currentYPosition);
    context.stroke();
    context.closePath();
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
    context.moveTo(currentXPosition, currentYPosition);
  }

  function showHelp() {
    var guide = "1. To move forward use 'forward [value]' <br>2. To move backward use 'backward [value]'<br>3. To rotate clockwise use 'right [value]', <br>counter clockwise - 'left [value]'."
    $("#commands-list").append("<p>" + guide + "</p>")
  }

  function computeX(context, x) {
    return (x-MINIMUM_X) / (MAXIMUM_X-MINIMUM_X)*(CANVAS_WIDTH);
  }

  function computeY(context, y) {
    return CANVAS_HEIGHT-(y-MINIMUM_Y)/(MAXIMUM_Y-MINIMUM_Y)*(CANVAS_HEIGHT);
  }

  function clearScreen(context, bgColorString) {
    context.globalCompositeOperation ="source-over";
    context.fillStyle = bgColorString;
    context.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // here it will be passed as a -90 or 90 depending on a fact whether we use right or left
  function computeAngle(value) {
    console.log(value, typeof value)
    naiveValue = currentAngle + value;
    if (naiveValue < 0) {
      newValue = 360 + naiveValue;
    } else {
      newValue = naiveValue % 360;
    }
    currentAngle =+ newValue;
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
    changeStrokeColor(colorHexValue)
    moveAndDraw(value);
    computeAngle(90);
    moveAndDraw(value);
    computeAngle(90);
    moveAndDraw(value);
    computeAngle(90);
    moveAndDraw(value);
    changeStrokeColor(strokeColor);
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
    // public static void koch(Turtle t, int n, double size) {
    // if(n==0)
    //     t.forward(size);
    // else {
    //     koch(t, n-1, size);
    //     t.left(60);
    //     koch(t, n-1, size);
    //     t.right(120);
    //     koch(t, n-1, size);
    //     t.left(60);
    //     koch(t, n-1, size);
    // }
    koch_f = function(a,b) {
      koch(a,b);
    }
});
