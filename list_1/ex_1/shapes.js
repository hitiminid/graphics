$(document).ready(function() {

  var getSelectedShape = function () {
    var shape = $("#shape-select").val();
    return shape;
  }

  var getSelectedColor = function () {
    var color = $("#input-field").val();
    return color;
  }

  function getSelectedValues() {
    var selectedColor = getSelectedColor();
    var selectedShape = getSelectedShape();

    switch(selectedShape) {
      case "square":
        console.log("square");
        break;

      case "rectangle":
        console.log("rectangle");
        break;

      case "triangle":
        console.log("triangle");
        createTriangle(100, selectedColor);
        break;

      case "circle":
        console.log("circle");
        createCircle(100, selectedColor);
        break;

      case "trapezoid":
        console.log("trapezoid");
        break;
    }
  }

  $("#createShapeButton").click(getSelectedValues);

});
