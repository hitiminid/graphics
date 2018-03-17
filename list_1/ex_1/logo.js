var sin     = Math.sin;
var cos     = Math.cos;
var bgColor = "#F1F1F1";

/*
todo:
[]  TODO: zdjecie
[]  TODO: odwrocone osie - Y rosnie do gory, X w prawo
[X] TODO: backward
[]  TODO: initial value should be in the middle of a screen
[]  TODO: ta sama wielkosc canvasa na X jak i na Y (nie mozna zrobic kwadratu)
[]  TODO: clear doesn't really deletes all objects on canvas (they are restored when new command is given)
[]  TODO: movement a rysowanie to różne rzeczy!!!
[]  TODO: double drawing
[x] TODO: right 15 on start
[]  TODO: move żółwik
[]  TODO: exceed bounds
krzywa kocha
*/

$(document).ready(function() {

  var commandCounter       = 0;
  var sendButton           = document.getElementById("send-button");
  var inputField           = document.getElementById("input-field");
  var board                = document.getElementById("board");
  var context              = board.getContext("2d");
  var singleCommandsArray  = ["clear", "help", "start"];
  var doubleCommandsArray  = ["forward", "backward", "left", "right", "color", "background","square"];
  var tripleCommandsArray  = ["move"];

  var CANVAS_HEIGHT  = board.height;
  var CANVAS_WIDTH   = board.width;
  var INITIAL_X_VALUE = CANVAS_WIDTH / 2;
  var INITIAL_Y_VALUE = CANVAS_HEIGHT / 2;
  var NUMBERS_REGEX   = /^[0-9,.]*$/;
  var HEX_COLOR_REGEX = /#[0-9a-f]{6}|#[0-9a-f]{3}/gi;

  var currentXPosition = INITIAL_X_VALUE;
  var currentYPosition = INITIAL_Y_VALUE;
  var currentAngle     = 0.0;

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
      } else {
        var value   = parseFloat(commandElements[1]);
        if (command == "move") {
          var value2 = parseFloat(commandElements[2]);
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

    if (command !== "color" && command !== "background") {
      valueRegex = NUMBERS_REGEX;
    } else {
      valueRegex = HEX_COLOR_REGEX;
    }
    var isValidValue = valueRegex.test(inputParts[1]);

    if (singleCommandsArray.includes(command) && inputParts.length == 1) {
      return true;
    } else if (doubleCommandsArray.includes(command) && inputParts.length == 2 && isValidValue) {
      return true;
    } else if (tripleCommandsArray.includes(command) && inputParts.length == 3) {
      //TODO: check whether move values are correct
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
        createSquare(value, 0);
      break;
    }
  }

  function move(xValue, yValue) {
    console.log("(" + currentXPosition + "," + currentYPosition + ") => (" + xValue + "," + yValue + ")");

    currentXPosition = xValue;
    currentYPosition = yValue;

    context.moveTo(xValue, yValue);
  }

  function moveAndDraw(value) {

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

    console.log("("+ oldX + "," + oldY + ") => (" + currentXPosition + "," + currentYPosition + ")");

    currentXPosition = checkIfBoundsAreExceeded(currentXPosition, CANVAS_WIDTH);
    currentYPosition = checkIfBoundsAreExceeded(currentYPosition, CANVAS_HEIGHT);

    context.lineTo(currentXPosition, currentYPosition);
    context.stroke();
  }

  function checkIfBoundsAreExceeded(value, maxValue) {
    if (value >= maxValue) {
      value = maxValue;
    } else if (value <= 0.0) {
      value = 0.0
    }
    return value;
  }

  function changeStrokeColor(colorHexValue) {
    context.strokeStyle = colorHexValue;
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
    var guide = "1. To move forward use 'forward [value]' <br>2. To move backward use 'backward [value]'<br>3. To rotate clockwise use 'right [value]', counter clockwise - 'left [value]'."
    $("#commands-list").append("<p>" + guide + "</p>")
  }

  function computeX(context, x) {
    return (x-rminx) / (rmaxx-rminx)*(CANVAS_WIDTH);
  }

  function computeY(context, y) {
    return CANVAS_HEIGHT-(y-rminy)/(rmaxy-rminy)*(CANVAS_HEIGHT);
  }

  function clearScreen(context, bgColorString) {
    context.globalCompositeOperation ="source-over";
    context.fillStyle = bgColorString;
    context.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT );
  }

  // here it will be passed as a -90 or 90 depending on a fact whether we use right or left
  function computeAngle(value) {
    naiveValue = currentAngle + value;
    if (naiveValue < 0) {
      newValue = 360 + naiveValue;
    } else {
      newValue = naiveValue % 360;
    }
    currentAngle =+ newValue;
    // console.log(currentAngle);
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

  function createCircle(radius) {
    context.beginPath();
    context.arc(100,75,radius,0,2*Math.PI);
    context.stroke();
  }

  function createTriangle(value, colorHexValue) {
    // changeStrokeColor(colorHexValue)
    computeAngle(60);
    moveAndDraw(value);
    computeAngle(60);
    moveAndDraw(value);
    computeAngle(60);
    moveAndDraw(value);
  }

  function createSquare(value, colorHexValue) {
    // changeStrokeColor(colorHexValue)
    moveAndDraw(value);
    computeAngle(90);
    moveAndDraw(value);
    computeAngle(90);
    moveAndDraw(value);
    computeAngle(90);
    moveAndDraw(value);
  }

  function createRectangle() {
    moveAndDraw(value);
    computeAngle(90);
    moveAndDraw(value);
    computeAngle(90);
    moveAndDraw(value);
    computeAngle(90);
    moveAndDraw(value);
    computeAngle(90);
  }

  function between(number, min, max) {
    return number >= min && number <= max;
  }
});
