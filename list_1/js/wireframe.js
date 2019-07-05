function wireframe() {

  var canvas = document.getElementById("gameBoard");
  var context = canvas.getContext("2d");
  var strokeStyle = "black";
  var obstaclesList = [];
  let doorsList     = [];
  var deltaZ        = 0;

  var randomInteger = function() {
    return Math.floor(Math.random() * 9) + 1;
  }

  var camera = {};
  camera.x = canvas.width / 2;
  camera.y = 0.0;
  camera.z = 0.0;

  var character = {};
  character.x = canvas.width / 200;
  character.y = canvas.height;
  character.vertices = [
    [450,400,1.25], [550,400,1.25], [550,500,1.25], [450,500,1.25], // 1, 2, 3, 4
    [450,400,1],    [550,400,1],    [550,500,1],    [450,500,1],    // 5, 6, 7, 8
  ];

  var areaVertices = [
    [0,0,10], [canvas.width,0,10], [canvas.width,canvas.height,10], [0,canvas.height,10], // 1, 2, 3, 4
    [0,0,1],  [canvas.width,0,1],  [canvas.width,canvas.height,1 ], [0,canvas.height,1],  // 5, 6, 7, 8
  ];

  var edges = [
    [1,2], [2,3], [3,4], [4,1],
    [5,6], [6,7], [7,8], [8,5],
    [1,5], [2,6], [3,7], [4,8],
  ];

  function clearValues() {
    deltaZ = 0;
    verticesList  = [];
    obstaclesList = [];
    doorsList     = [];
    character.x = canvas.width / 200;
    character.y = canvas.height;
    character.vertices = [
      [450,400,1.25], [550,400,1.25], [550,500,1.25], [450,500,1.25], // 1, 2, 3, 4
      [450,400,1],    [550,400,1],    [550,500,1],    [450,500,1],    // 5, 6, 7, 8
    ];
  }

  function start() {
    clearValues();
    generateObstacles();
    draw();
  }

  function transform3Dto2D(vertices) {
      let x;
      let y;
      let vertex;
      let transformTemp;
      let resultMatrix = [];
      let newVertex;

      for (let i = 0; i < vertices.length; i++) {
        vertex = vertices[i]       // x , y, z
        transformTemp = vertex[2]; // z
        transformTemp += deltaZ;
        transformTemp = Math.max(transformTemp, 1);
        x = (vertex[0] - camera.x) * ( 1.0 / transformTemp) + camera.x;
        y = (vertex[1] - camera.y) * ( 1.0 / transformTemp) + camera.y;
        newVertex = [x, y];
        resultMatrix.push(newVertex);
      }
      return resultMatrix;
  }

  function transformCharacter3Dto2D(vertices) {
      let x;
      let y;
      let vertex;
      let transformTemp;
      let resultMatrix = [];
      let newVertex;

      for (let i = 0; i < vertices.length; i++) {
        vertex = vertices[i]       // x , y, z
        transformTemp = vertex[2]; // z
        x = (vertex[0] - camera.x) * ( 1.0 / transformTemp) + camera.x;
        y = (vertex[1] - camera.y) * ( 1.0 / transformTemp) + camera.y;
        newVertex = [x, y];
        resultMatrix.push(newVertex);
      }
      return resultMatrix;
  }

  function createArea(vertices, edges) {
    context.beginPath();
    context.strokeStyle = "black";
    let transformedVertices = transform3Dto2D(vertices);
    let startPoint;
    let endPoint;
    let edge;
    let vertex;

    for (let i = 0; i < edges.length; i++) {
      edge = edges[i];
      vertex = transformedVertices[edge[0]-1];  // e[0] - starting vertex
      context.moveTo(vertex[0], vertex[1]);     // move to starting point
      vertex = transformedVertices[edge[1]-1];
      context.lineTo(vertex[0], vertex[1]);     // move to ending point with draw
    }
    context.stroke();
  }

  function createCharacter() {
    context.beginPath();
    context.strokeStyle = "red";
    let transformedVertices = transformCharacter3Dto2D(character.vertices);
    let startPoint;
    let endPoint;
    let edge;
    let vertex;

    for (let i = 0; i < edges.length; i++) {
      edge = edges[i];
      vertex = transformedVertices[edge[0]-1]; // e[0] - starting vertex
      context.moveTo(vertex[0], vertex[1]);    // move to starting point
      vertex = transformedVertices[edge[1]-1];
      context.lineTo(vertex[0], vertex[1]);    // move to starting point
    }
    context.stroke();
  }

  function draw() {
      context.clearRect(0,0,1500,500);
      createArea(areaVertices, edges);
      createCharacter();
      createObstacles();
  }

  function moveLeft() {
    if (character.x > 1) {
      for (let i = 0; i < character.vertices.length; i++) {
         character.vertices[i][0] -= 100;// x value
      }
      character.x--;
    }
    draw();
  }

  function moveRight() {
    if (character.x < 9) {
      for (let i = 0; i < character.vertices.length; i++) {
         character.vertices[i][0] += 100;// x value
      }
      character.x++;
    }
    draw();
  }

  function createObstacles() {
    for (let i = 0; i < obstaclesList.length; i++) {
      verticesList = obstaclesList[i];
      createArea(verticesList, edges);
    }
  }

  function generateObstacles() {
    for (let i = 2; i <= 6; i+=2) {
      generateObstacle(i);
    }
  }

  function generateObstacle(z) {
    let doorStartX = randomInteger();
    let verticesList = [];
    doorsList.push(doorStartX);

    if (doorStartX > 1) {
      let x = doorStartX*100-100;
      verticesList = [
        [0,300,z+1], [x,300,z+1], [x,500,z+1], [0,500,z+1], // 1, 2, 3, 4
        [0,300,z], [x,300,z], [x,500,z], [0,500,z]
      ]
      obstaclesList.push(verticesList);
    }

    if (doorStartX < 9) {
      let x = doorStartX * 100 + 100;
      verticesList = [
        [x,300,z+1], [canvas.width,300,z+1], [canvas.width,500,z+1], [x,500,z+1], // 1, 2, 3, 4
        [x,300,z],   [canvas.width,300,z],   [canvas.width,500,z],   [x,500,z]
      ]
      obstaclesList.push(verticesList);
    }
  }

  function moveObstacles() {
    if (doorsList.length === 0) {
      alert("You have won!");
      start();
    } else {
      if(doorsList[0] == character.x) {
        deltaZ -= 2;
        if (doorsList[0] != 1 && doorsList[0] != 9) {
          obstaclesList.shift();
        }
        obstaclesList.shift();
        doorsList.shift();
      } else {
        alert("You have lost!");
        start();
      }
      draw();
    }
  }

  document.addEventListener("keypress", function(e) {
      e.preventDefault();
      switch(e.keyCode || e.which) {
        case 97:
          moveLeft();
          break;

        case 100:
          moveRight();
          break;

        case 119:
          moveObstacles();
          break;
      }
  });
  start();

}
