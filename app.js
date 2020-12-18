"use strict";

const app = {
  savedCanvas: null,
  firstCanvas: null,
  currentEffect: null,
  secondCanvas: null,
  imageData: null,
  dataURL:null,
  img: null,
  x1: null,
  x2: null,
  y1: null,
  y2: null,
  select: null,
  isSelected: false,
  clX: null,
  clY: null,
  modify: true,
};
//-----------------------------------------------
// Change Effect Function
// Functia schimba efectul curent cu cel primit ca parametru
//-----------------------------------------------
app.changeEffect = function (effect) {
  if (effect !== app.currentEffect) {
    app.currentEffect = effect;
    app.draw();
  }
};

//-----------------------------------------------
// Change Cursor Style Function
// Functia schimba tipul cursorului in momentul in care se face
//trecerea peste canvas si daca este apasat butonul de select
//-----------------------------------------------
function firstCanvasMouseOver() {
  app.firstCanvas.style.cursor = "crosshair";
}

//-----------------------------------------------
// Functia salveaza coordonatele de pornire ale selectie
//-----------------------------------------------
function firstCanvasMouseDown(ev) {
  app.x1 = (ev.offsetX * app.firstCanvas.width) / app.firstCanvas.clientWidth;
  app.y1 = (ev.offsetY * app.firstCanvas.height) / app.firstCanvas.clientHeight;

  app.clX = ev.clientX;
  app.clY = ev.clientY;
  app.isSelected = true;
}

//-----------------------------------------------
// Functia incearca sa creeze un dreptunghi pentru vizualizarea
//selectiei
//-----------------------------------------------
function firstCanvasMouseMove(ev2) {
  if (app.isSelected == true) {
    app.select.style.position = "fixed";
    app.select.style.display = "initial";
    app.select.style.border = "2px dashed black";
    if (app.modify == true) {
      app.clY = ev2.y;
      app.clX = ev2.x;
      app.select.style.top = app.clY - 5 + "px";
      app.select.style.left = app.clX - 5 + "px";
    }
    app.modify = false;
    app.select.style.height = ev2.clientY - app.clY - 5 + "px";
    app.select.style.width = ev2.clientX - app.clX - 5 + "px";
    console.log("hello");
  }
}

//-----------------------------------------------
// Functia salveaza coordonatele finale ale selectiei
//si lasa butonul select pe false, astfel cursorul revine
//la normal la hover peste canvas
//-----------------------------------------------
function firstCanvasMouseUp(ev) {
  app.x2 = (ev.offsetX * app.firstCanvas.width) / app.firstCanvas.clientWidth;
  app.y2 = (ev.offsetY * app.firstCanvas.height) / app.firstCanvas.clientHeight;

  app.modify = true;
  app.isSelected = false;
}

//-----------------------------------------------
// Select Area Function
// Adaugarea de eventListener pentru event-uri de pe canvas (mouseover,
//mousedown, mouseup, mousemove), functiile fiind definite mai sus
//-----------------------------------------------
app.selectArea = function () {
  app.firstCanvas.addEventListener("mouseover", firstCanvasMouseOver);
  app.firstCanvas.addEventListener("mousedown", firstCanvasMouseDown);
  //app.firstCanvas.addEventListener("mousemove", firstCanvasMouseMove);
  app.firstCanvas.addEventListener("mouseup", firstCanvasMouseUp);
};

app.draw = function () {
  //redimensionare canvas
  app.firstCanvas.width = app.savedCanvas.width;
  app.firstCanvas.height = app.savedCanvas.height;

  switch (app.currentEffect) {
    case "normal":
      //desenare img pe visible canvas
      const vContext = this.firstCanvas.getContext("2d");
      vContext.drawImage(app.savedCanvas, 0, 0);
      break;
    case "grayscale":
      app.grayscale();
      break;
    case "treshold":
      app.threshold(180);
      break;
    case "sepia":
      app.sepia();
      break;
    case "invert":
      app.invert();
      break;
    case "red":
      app.red();
      break;
    case "green":
      app.green();
      break;
    case "blue":
      app.blue();
      break;
    case "2channels":
      app.twoChannles();
      break;
    case "darker":
      app.darker();
      break;
    case "lighter":
      app.lighter();
      break;
    case "pixelate":
      app.pixelate(4);
      break;
  }
  drawHistogram();
  console.log(app.firstCanvas.height + " resize3: " + app.firstCanvas.width);
};

app.pixelate = function (step) {
  const oContext = app.savedCanvas.getContext("2d");
  let X1, Y1, X2, Y2;
  var values = app.calculateXY();
  X1 = values[0];
  Y1 = values[1];
  X2 = values[2];
  Y2 = values[3];
  const imageData = oContext.getImageData(
    0,
    0,
    app.savedCanvas.width,
    app.savedCanvas.height
  );
  const data = imageData.data;

  for (let i = 0; i < imageData.height; i += step) {
    const offsetLiniiAnterioare = i * imageData.width * 4;

    for (let j = 0; j < imageData.width; j += step) {
      let pij = j * 4 + offsetLiniiAnterioare;
      const r = data[pij];
      const g = data[pij + 1];
      const b = data[pij + 2];
      if (i >= Y1 && i <= Y2 && j >= X1 && j <= X2) {
        for (let k = 0; k < step; k++)
          for (let l = 0; l < step; l++) {
            const kl = (i + k) * imageData.width * 4 + (j + l) * 4;
            data[kl] = r;
            data[kl] = g;
            data[kl] = b;
          }
      }
    }

    const vContext = app.firstCanvas.getContext("2d");
    vContext.putImageData(imageData, 0, 0);
    drawHistogram();
  }
};

app.pixelate2 = function () {};

app.darker = function () {
  const oContext = app.savedCanvas.getContext("2d");
  let X1, Y1, X2, Y2;
  var values = app.calculateXY();
  X1 = values[0];
  Y1 = values[1];
  X2 = values[2];
  Y2 = values[3];
  const imageData = oContext.getImageData(
    0,
    0,
    app.savedCanvas.width,
    app.savedCanvas.height
  );
  const data = imageData.data;
  for (let i = 0; i < imageData.height; i += 1) {
    const offsetLiniiAnterioare = i * imageData.width * 4;

    for (let j = 0; j < imageData.width; j += 1) {
      if (i >= Y1 && i <= Y2 && j >= X1 && j <= X2) {
        let pij = j * 4 + offsetLiniiAnterioare;
        const r = data[pij];
        const g = data[pij + 1];
        const b = data[pij + 2];

        let v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        data[pij] -= v;
        data[pij + 1] -= v;
        data[pij + 2] -= v;
      }
    }
  }
  const vContext = app.firstCanvas.getContext("2d");
  vContext.putImageData(imageData, 0, 0);
};

////////
////////
app.lighter = function () {
  const oContext = app.savedCanvas.getContext("2d");
  let X1, Y1, X2, Y2;
  var values = app.calculateXY();
  X1 = values[0];
  Y1 = values[1];
  X2 = values[2];
  Y2 = values[3];
  console.log(X1 + " " + Y1 + " " + X2 + " " + Y2);
  const imageData = oContext.getImageData(
    0,
    0,
    app.savedCanvas.width,
    app.savedCanvas.height
  );
  console.log(imageData.data);
  const data = imageData.data;
  for (let i = 0; i < imageData.height; i += 1) {
    const offsetLiniiAnterioare = i * imageData.width * 4;

    for (let j = 0; j < imageData.width; j += 1) {
      if (i >= Y1 && i <= Y2 && j >= X1 && j <= X2) {
        let pij = j * 4 + offsetLiniiAnterioare;
        const r = data[pij];
        const g = data[pij + 1];
        const b = data[pij + 2];
        let v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        data[pij] += v;
        data[pij + 1] += v;
        data[pij + 2] += v;
      }
    }
  }
  const vContext = app.firstCanvas.getContext("2d");
  vContext.putImageData(imageData, 0, 0);
  drawHistogram();
};

app.twoChannles = function () {
  const oContext = app.savedCanvas.getContext("2d");
  let X1, Y1, X2, Y2;
  var values = app.calculateXY();
  X1 = values[0];
  Y1 = values[1];
  X2 = values[2];
  Y2 = values[3];
  console.log(X1 + " " + Y1 + " " + X2 + " " + Y2);
  const imageData = oContext.getImageData(
    0,
    0,
    app.savedCanvas.width,
    app.savedCanvas.height
  );
  console.log(imageData.data);
  const data = imageData.data;
  for (let i = 0; i < imageData.height; i += 1) {
    const offsetLiniiAnterioare = i * imageData.width * 4;

    for (let j = 0; j < imageData.width; j += 1) {
      if (i >= Y1 && i <= Y2 && j >= X1 && j <= X2) {
        let pij = j * 4 + offsetLiniiAnterioare;
        const r = data[pij];
        const g = data[pij + 1];
        const b = data[pij + 2];
        data[pij] = r;
        data[pij + 1] = g;
        data[pij + 2] = g;
      }
    }
  }
  const vContext = app.firstCanvas.getContext("2d");
  vContext.putImageData(imageData, 0, 0);
  drawHistogram();
};

app.red = function () {
  const oContext = app.savedCanvas.getContext("2d");
  let X1, Y1, X2, Y2;
  var values = app.calculateXY();
  X1 = values[0];
  Y1 = values[1];
  X2 = values[2];
  Y2 = values[3];
  console.log(X1 + " " + Y1 + " " + X2 + " " + Y2);
  const imageData = oContext.getImageData(
    0,
    0,
    app.savedCanvas.width,
    app.savedCanvas.height
  );
  console.log(imageData.data);
  const data = imageData.data;
  for (let i = 0; i < imageData.height; i += 1) {
    const offsetLiniiAnterioare = i * imageData.width * 4;

    for (let j = 0; j < imageData.width; j += 1) {
      if (i >= Y1 && i <= Y2 && j >= X1 && j <= X2) {
        let pij = j * 4 + offsetLiniiAnterioare;
        data[pij + 1] = 0;
        data[pij + 2] = 0;
      }
    }
  }
  const vContext = app.firstCanvas.getContext("2d");
  vContext.putImageData(imageData, 0, 0);
  drawHistogram();
};

app.green = function () {
  const oContext = app.savedCanvas.getContext("2d");
  let X1, Y1, X2, Y2;
  var values = app.calculateXY();
  X1 = values[0];
  Y1 = values[1];
  X2 = values[2];
  Y2 = values[3];

  const imageData = oContext.getImageData(
    0,
    0,
    app.savedCanvas.width,
    app.savedCanvas.height
  );

  const data = imageData.data;
  for (let i = 0; i < imageData.height; i += 1) {
    const offsetLiniiAnterioare = i * imageData.width * 4;

    for (let j = 0; j < imageData.width; j += 1) {
      if (i >= Y1 && i <= Y2 && j >= X1 && j <= X2) {
        let pij = j * 4 + offsetLiniiAnterioare;
        data[pij] = 0;
        data[pij + 2] = 0;
      }
    }
  }
  const vContext = app.firstCanvas.getContext("2d");
  vContext.putImageData(imageData, 0, 0);
  drawHistogram();
};

app.blue = function () {
  const oContext = app.savedCanvas.getContext("2d");
  let X1, Y1, X2, Y2;
  var values = app.calculateXY();
  X1 = values[0];
  Y1 = values[1];
  X2 = values[2];
  Y2 = values[3];

  const imageData = oContext.getImageData(
    0,
    0,
    app.savedCanvas.width,
    app.savedCanvas.height
  );

  const data = imageData.data;
  for (let i = 0; i < imageData.height; i += 1) {
    const offsetLiniiAnterioare = i * imageData.width * 4;

    for (let j = 0; j < imageData.width; j += 1) {
      if (i >= Y1 && i <= Y2 && j >= X1 && j <= X2) {
        let pij = j * 4 + offsetLiniiAnterioare;
        data[pij + 1] = 0;
        data[pij] = 0;
      }
    }
  }
  const vContext = app.firstCanvas.getContext("2d");
  vContext.putImageData(imageData, 0, 0);
  drawHistogram();
};

app.invert = function () {
  const oContext = app.savedCanvas.getContext("2d");
  let X1, Y1, X2, Y2;
  var values = app.calculateXY();
  X1 = values[0];
  Y1 = values[1];
  X2 = values[2];
  Y2 = values[3];

  const imageData = oContext.getImageData(
    0,
    0,
    app.savedCanvas.width,
    app.savedCanvas.height
  );

  const data = imageData.data;
  for (let i = 0; i < imageData.height; i += 1) {
    const offsetLiniiAnterioare = i * imageData.width * 4;

    for (let j = 0; j < imageData.width; j += 1) {
      if (i >= Y1 && i <= Y2 && j >= X1 && j <= X2) {
        let pij = j * 4 + offsetLiniiAnterioare;
        data[pij] = 255 - data[pij];
        data[pij + 1] = 255 - data[pij + 1];
        data[pij + 2] = 255 - data[pij + 2];
      }
    }
  }
  const vContext = app.firstCanvas.getContext("2d");
  vContext.putImageData(imageData, 0, 0);
  drawHistogram();
};

app.sepia = function () {
  const oContext = app.savedCanvas.getContext("2d");
  let X1, Y1, X2, Y2;
  var values = app.calculateXY();
  X1 = values[0];
  Y1 = values[1];
  X2 = values[2];
  Y2 = values[3];

  const imageData = oContext.getImageData(
    0,
    0,
    app.savedCanvas.width,
    app.savedCanvas.height
  );

  const data = imageData.data;
  for (let i = 0; i < imageData.height; i += 1) {
    const offsetLiniiAnterioare = i * imageData.width * 4;

    for (let j = 0; j < imageData.width; j += 1) {
      if (i >= Y1 && i <= Y2 && j >= X1 && j <= X2) {
        let pij = j * 4 + offsetLiniiAnterioare;
        const R = data[pij];
        const G = data[pij + 1];
        const B = data[pij + 2];

        const tr = 0.393 * R + 0.769 * G + 0.189 * B;
        const tg = 0.349 * R + 0.686 * G + 0.168 * B;
        const tb = 0.272 * R + 0.534 * G + 0.131 * B;

        if (tr > 255) data[pij] = 255;
        else data[pij] = tr;

        if (tg > 255) data[pij + 1] = 255;
        else data[pij + 1] = tg;

        if (tb > 255) data[pij + 2] = 255;
        else data[pij + 2] = tb;
      }
    }
  }
  const vContext = app.firstCanvas.getContext("2d");
  vContext.putImageData(imageData, 0, 0);
  drawHistogram();
};

app.threshold = function (threshold) {
  const oContext = app.savedCanvas.getContext("2d");
  let X1, Y1, X2, Y2;
  var values = app.calculateXY();
  X1 = values[0];
  Y1 = values[1];
  X2 = values[2];
  Y2 = values[3];

  const imageData = oContext.getImageData(
    0,
    0,
    app.savedCanvas.width,
    app.savedCanvas.height
  );

  const data = imageData.data;
  for (let i = 0; i < imageData.height; i += 1) {
    const offsetLiniiAnterioare = i * imageData.width * 4;

    for (let j = 0; j < imageData.width; j += 1) {
      if (i >= Y1 && i <= Y2 && j >= X1 && j <= X2) {
        let pij = j * 4 + offsetLiniiAnterioare;
        const r = data[pij];
        const g = data[pij + 1];
        const b = data[pij + 2];
        let v = 0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold ? 255 : 0;
        data[pij] = data[pij + 1] = data[pij + 2] = v;
      }
    }
  }
  const vContext = app.firstCanvas.getContext("2d");
  vContext.putImageData(imageData, 0, 0);
  drawHistogram();
};

app.grayscale = function () {
  const oContext = app.savedCanvas.getContext("2d");
  let X1, Y1, X2, Y2;
  var values = app.calculateXY();
  X1 = values[0];
  Y1 = values[1];
  X2 = values[2];
  Y2 = values[3];

  const imageData = oContext.getImageData(
    0,
    0,
    app.savedCanvas.width,
    app.savedCanvas.height
  );

  const data = imageData.data;
  for (let i = 0; i < imageData.height; i += 1) {
    const offsetLiniiAnterioare = i * imageData.width * 4;

    for (let j = 0; j < imageData.width; j += 1) {
      if (i >= Y1 && i <= Y2 && j >= X1 && j <= X2) {
        let pij = j * 4 + offsetLiniiAnterioare;
        const r = data[pij];
        const g = data[pij + 1];
        const b = data[pij + 2];

        const average = Math.round((r + g + b) / 3);

        data[pij] = data[pij + 1] = data[pij + 2] = average;
      }
    }
  }

  const vContext = app.firstCanvas.getContext("2d");
  vContext.putImageData(imageData, 0, 0);
  drawHistogram();
};

//-----------------------------------------------
// Download Function
//-----------------------------------------------
app.download = () => {
  let image = app.secondCanvas.toDataURL();
  let link = document.createElement("a");
  link.download = "image.png";
  link.href = image;

  link.click();
};

//-----------------------------------------------
// Calculate Coordinates for X1,X2,Y1,Y2
//-----------------------------------------------
app.calculateXY = () => {
  let X1, X2, Y1, Y2;
  if (parseFloat(app.x1) < parseFloat(app.x2)) {
    X1 = app.x1;
    X2 = app.x2;
  } else {
    X1 = parseFloat(app.x2);
    X2 = parseFloat(app.x1);
  }

  if (parseFloat(app.y1) < parseFloat(app.y2)) {
    Y1 = parseFloat(app.y1);
    Y2 = parseFloat(app.y2);
  } else {
    Y1 = parseFloat(app.y2);
    Y2 = parseFloat(app.y1);
  }

  return [X1, Y1, X2, Y2];
};

//-----------------------------------------------
// Delete Area Function
//-----------------------------------------------
app.deleteArea = () => {
  const oContext = app.savedCanvas.getContext("2d");
  let X1, Y1, X2, Y2;
  var values = app.calculateXY();
  X1 = values[0];
  Y1 = values[1];
  X2 = values[2];
  Y2 = values[3];
  console.log(X1 + " " + Y1 + " " + X2 + " " + Y2);
  const imageData = oContext.getImageData(
    0,
    0,
    app.savedCanvas.width,
    app.savedCanvas.height
  );
  console.log(imageData.data);
  const data = imageData.data;
  for (let i = 0; i < imageData.height; i += 1) {
    const offsetLiniiAnterioare = i * imageData.width * 4;

    for (let j = 0; j < imageData.width; j += 1) {
      if (i >= Y1 && i <= Y2 && j >= X1 && j <= X2) {
        let pij = j * 4 + offsetLiniiAnterioare;
        data[pij] = data[pij + 1] = data[pij + 2] = 255;
      }
    }
    const vContext = app.firstCanvas.getContext("2d");
    vContext.putImageData(imageData, 0, 0);
  }
};

//-----------------------------------------------
// Move Area Function
//-----------------------------------------------
app.moveArea = () => {
  console.log("Buna");

  let X1, Y1, X2, Y2;
  var values = app.calculateXY();
  X1 = values[0];
  Y1 = values[1];
  X2 = values[2];
  Y2 = values[3];
  console.log(X1 + " " + Y1 + " " + X2 + " " + Y2);

  app.secondCanvas.height = app.firstCanvas.height;
  app.secondCanvas.width = app.firstCanvas.width;
  let context2 = app.secondCanvas.getContext("2d");
  console.log("merge");
  let context = app.firstCanvas.getContext("2d");
  if (
    parseFloat(X2) - parseFloat(X1) == 0 ||
    parseFloat(Y2) - parseFloat(Y1) == 0
  )
    alert("Selectia nu este facuta corespunzator");
  else {
    let imageData = context.getImageData(
      parseFloat(X1),
      parseFloat(Y1),
      parseFloat(X2) - parseFloat(X1),
      parseFloat(Y2) - parseFloat(Y1)
    );
    console.log(imageData);
    //let imageData=context.getImageData(150,154,50,50);
    context2.putImageData(imageData, parseFloat(X1), parseFloat(Y1));
    // context.beginPath();
    // context.rect(X1, Y1, X2 - X1, Y2 - Y1);
    // context.stroke();
  }

  app.firstCanvas.removeEventListener("mouseup", firstCanvasMouseUp);
  app.firstCanvas.removeEventListener("mousedown", firstCanvasMouseDown);
  app.firstCanvas.removeEventListener("mouseover", firstCanvasMouseOver);
  app.firstCanvas.removeEventListener("mousemove", firstCanvasMouseMove);
  document.getElementById("firstCanvas").style.cursor = "default";
  app.select.style.all = "unset";
};

app.resizeByWidthCanvas = () => {
  const inWidth = document.getElementById("inWidth");
  app.firstCanvas.style.width = inWidth.value + "px";
  app.firstCanvas.style.height =
    (inWidth.value * app.savedCanvas.height) / app.savedCanvas.width + "px";
  console.log(app.savedCanvas.height + " offscreen" + app.savedCanvas.width);
  const vContext = app.firstCanvas.getContext("2d");

  vContext.drawImage(
    app.savedCanvas,
    0,
    0,
    app.firstCanvas.width,
    app.firstCanvas.height
  );
};

app.resizeByHeightCanvas = () => {
  const inHeight = document.getElementById("inHeight");
  // console.log(app.firstCanvas.height);
  // console.log(inHeight.value);
  // app.firstCanvas.style.height = inHeight.value / 2 + "px";
  // app.firstCanvas.style.width =
  //   ((inHeight.value / 2) * app.savedCanvas.width) /
  //     2 /
  //     (app.savedCanvas.height / 2) +
  //   "px";
    // const img=new Image();
  // img.addEventListener("load", function (ev) {
  //   img.style.height*=0.75
  //   img.style.width*=0.75
  //   app.savedCanvas.height = img.style.height;
  //   app.savedCanvas.width = img.style.width;

  //   const oContext = app.savedCanvas.getContext("2d");
    

  //   oContext.drawImage(ev.target, 0, 0);
  //   app.imageData = oContext.getImageData(
  //     0,
  //     0,
  //     app.savedCanvas.width,
  //     app.savedCanvas.height
  //   );

  //   app.currentEffect = "normal";
  //   app.draw();
  //   drawHistogram();
  // });
  // img.src = app.dataURL;

  // app.savedCanvas.height *=0.75
  // app.savedCanvas.width *=0.75
  // const oContext=app.savedCanvas.getContext("2d");
  // oContext.putImageData(app.imageData,0,0);
  app.savedCanvas.width*=2
  app.savedCanvas.height*=2
  const vContext = app.savedCanvas.getContext("2d");
  
  vContext.clearRect(0, 0, app.savedCanvas.width, app.savedCanvas.height);

  //  vContext.drawImage(app.img,0,0,app.savedCanvas.width,app.savedCanvas.height,0,0,app.savedCanvas.width,app.savedCanvas.height)

  //  vContext.drawImage(app.img,0,0,app.img.naturalWidth,app.img.naturalHeight,0,0,app.img.naturalWidth,app.img.naturalHeight)

   vContext.drawImage(app.img,0,0,app.img.naturalWidth,app.img.naturalHeight,0,0,app.savedCanvas.width,app.savedCanvas.height)
  // //oContext.scale(0.75,0.75)
   app.currentEffect="normal";
   app.draw();
   drawHistogram();
  


  
  //vContext.restore();
};

app.resizeByBothCanvas = () => {
  const inWidth = document.getElementById("inWidth");
  const inHeight = document.getElementById("inHeight");

  app.firstCanvas.style.height = inHeight.value + "px";
  app.firstCanvas.style.width = inWidth.value + "px";

  const vContext = app.firstCanvas.getContext("2d");

  vContext.drawImage(
    app.savedCanvas,
    0,
    0,
    app.firstCanvas.style.width,
    app.firstCanvas.style.height
  );

  app.draw();
  console.log(app.firstCanvas.height);
};

app.addText = (ev) => {
  const oContext = app.savedCanvas.getContext("2d");
  oContext.putImageData(app.imageData, 0, 0);
  var inY = document.getElementById("textY").value;
  var inX = document.getElementById("textX").value;
  var inColor = document.getElementById("textColor").value;
  let inSize = document.getElementById("textSize");
  var inText = document.getElementById("textText");
  oContext.font = inSize.value + "px Ariel";
  oContext.fillStyle = inColor;
  oContext.fillText(inText.value, inX, inY);
  console.log(inSize.value);
  app.imageData = oContext.getImageData(
    0,
    0,
    app.savedCanvas.width,
    app.savedCanvas.height
  );
  app.currentEffect = "normal";
  app.draw();
};

app.load = () => {
  app.firstCanvas = document.getElementById("firstCanvas");
  app.secondCanvas = document.getElementById("secondCanvas");
  app.savedCanvas = document.createElement("canvas");
  const spanColor = document.getElementById("color");

  app.firstCanvas.addEventListener("mousemove", (ev) => {
    const x =
      (ev.offsetX * app.firstCanvas.width) / app.firstCanvas.clientWidth;
    const y =
      (ev.offsetY * app.firstCanvas.height) / app.firstCanvas.clientHeight;

    const vContext = app.firstCanvas.getContext("2d");
    const imageData = vContext.getImageData(x, y, 1, 1);
    const data = imageData.data;
    const r = data[0];
    const g = data[1];
    const b = data[2];

    if ((r + g + b) / 3 > 123) spanColor.style.color = "#000000";
    else spanColor.style.color = "#ffffff";

    spanColor.style.left = ev.clientX + 10 + "px";
    spanColor.style.top = ev.clientY + 10 + "px";
    spanColor.style.position = "fixed";
    const color = `rgb(${r},${g},${b})`;
    spanColor.innerText = color;
    spanColor.style.backgroundColor = color;
  });

  //-----------------------------------------------
  //  Adaugare eveniment de change la momentul selectiei efectului ales
  //din elementul de tip select din pagina
  //  Am dorit o implementare cu select deoarece se ocupa foarte mult
  //spatiu cu butoane individuale
  //-----------------------------------------------
  const select = document.querySelector(".selectOptions");
  select.addEventListener("change", (ev) => {
    console.log(ev.target.value);
    const effect = ev.target.value;
    app.changeEffect(effect);
  });

  //Adaugare eveniment pentru functia de dragover a documentului
  document.addEventListener("dragover", function (e) {
    e.preventDefault();
  });

  //Adaugare eveniment pentru functia de drop a documentului
  document.addEventListener("drop", function (e) {
    e.preventDefault();

    let files = e.dataTransfer.files;
    console.log(files);

    if (files.length > 0) {
      let fileReader = new FileReader();
      fileReader.addEventListener("load", function (e) {
        let dataURL = e.target.result;
        let img = document.createElement("img");
        app.dataURL=dataURL;
        img.addEventListener("load", function (e) {
          app.savedCanvas.width = img.naturalWidth;
          app.savedCanvas.height = img.naturalHeight;
          let oContext = app.savedCanvas.getContext("2d");
          oContext.drawImage(img, 0, 0);
          app.imageData = oContext.getImageData(
            0,
            0,
            app.savedCanvas.width,
            app.savedCanvas.height
          );

          app.currentEffect = "normal";
          app.img=img;
          app.draw();
          drawHistogram();
        });

        img.src = dataURL;
      });

      fileReader.readAsDataURL(files[0]);
    }
  });

  const fileBrowser = document
    .getElementById("fileBrowser")
    .addEventListener("change", function (ev) {
      const files = ev.target.files;

      const reader = new FileReader();

      reader.addEventListener("load", function (ev) {
        const dataURL = ev.target.result;
        app.dataURL=dataURL;
        console.log(ev.target + " app img");

        const img = document.createElement("img");

        img.addEventListener("load", function (ev) {
          app.savedCanvas.height = img.naturalHeight;
          app.savedCanvas.width = img.naturalWidth;

          const oContext = app.savedCanvas.getContext("2d");
          oContext.drawImage(ev.target, 0, 0);
          app.imageData = oContext.getImageData(
            0,
            0,
            app.savedCanvas.width,
            app.savedCanvas.height
          );

          app.currentEffect = "normal";
        app.img=img;
          app.draw();
          drawHistogram();
        });
        img.src = dataURL;
        

      });
      reader.readAsDataURL(files[0]);
    });

  //-----------------------------------------------
  // Handle Select Area Button
  //-----------------------------------------------
  const selectArea = document.getElementById("selectArea");
  selectArea.addEventListener("click", () => {
    app.selectArea();
  });

  //-----------------------------------------------
  // Handle Delete Area Button
  //-----------------------------------------------
  const deleteArea = document.getElementById("deleteArea");
  deleteArea.addEventListener("click", () => {
    app.deleteArea();
  });

  //-----------------------------------------------
  // Handle Move Area Button
  //-----------------------------------------------
  const move = document.getElementById("moveArea");
  move.addEventListener("click", () => {
    app.moveArea();
  });

  //-----------------------------------------------
  // Handle Download Canvas Button
  //-----------------------------------------------
  const download = document.getElementById("download");
  download.addEventListener("click", () => {
    app.download();
  });

  //-----------------------------------------------
  // Handle Resize By Width Canvas Button
  //-----------------------------------------------
  const resizeWidth = document.getElementById("resizeWidth");
  resizeWidth.addEventListener("click", () => {
    app.resizeByWidthCanvas();
  });

  //-----------------------------------------------
  // Handle Resize By Height Canvas Button
  //-----------------------------------------------
  const resizeHeight = document.getElementById("resizeHeight");
  resizeHeight.addEventListener("click", () => {
    app.resizeByHeightCanvas();
  });

  //-----------------------------------------------
  // Handle Resize By Both Canvas Button
  //-----------------------------------------------
  const resizeBoth = document.getElementById("resizeBoth");
  resizeBoth.addEventListener("click", () => {
    app.resizeByBothCanvas();
  });

  //-----------------------------------------------
  // Create Div for Select Box
  //Acest div a fost creat initial pentru a fi dreptunghiul de selectie
  //-----------------------------------------------
  app.select = document.createElement("div");
  document.body.appendChild(app.select);

  //-----------------------------------------------
  // Handle Add Text prin apasare buton "Add Text" si creare
  //eventListener pe click pe el
  //-----------------------------------------------
  const addText = document.getElementById("addText");
  addText.addEventListener("click", (ev) => {
    app.addText(ev);
  });
};

class BarChart {
  constructor(canvas) {
    this.canvas = canvas;
  }
  draw(values, showLabels = true) {
    let context = this.canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    let maxValue = Math.max(...values);
    let f = this.canvas.height / maxValue;

    let rectW = this.canvas.width / values.length;
    let rectWVisible = rectW * 0.7;

    //context.strokeStyle = "green";
    // context.lineWidth = 2;
    // context.textAlign = "center";
    // context.font="30px Arial";

    for (let i = 0; i < values.length; i++) {
      let rectH = values[i] * f * 0.9;

      let rectX = rectW * i;
      let rectY = this.canvas.height - rectH;

      if (i % 3 === 0) context.fillStyle = "#ff0000";
      else if (i % 3 === 1) context.fillStyle = "#00ff00";
      else if (i % 3 === 2) context.fillStyle = "#0000ff";

      context.fillRect(rectX, rectY, rectWVisible * 0.9, rectH);
      if (showLabels == true) {
        context.fillStyle = "#000000";
        context.fillText(values[i], rectX + rectWVisible / 2, rectY);
      }
    }
  }
}

function drawHistogram() {
  let canvasHist = document.getElementById("canvasHistogram");

  let barChart = new BarChart(canvasHist);
  let context = app.firstCanvas.getContext("2d");
  let imageData = context.getImageData(
    0,
    0,
    app.savedCanvas.width,
    app.savedCanvas.height
  );
  let pixelColorArray = imageData.data;

  let v = [];
  for (let i = 0; i < 256; i++) {
    v.push(0);
  }

  for (let i = 0; i < pixelColorArray.length; i += 4) {
    let r = pixelColorArray[i];
    let g = pixelColorArray[i + 1];
    let b = pixelColorArray[i + 2];

    let average = Math.round((r + g + b) / 3);
    v[average]++;
  }
  barChart.draw(v, false);
  // console.log(v);
}

//
window.addEventListener("DOMContentLoaded", (event) => {
  app.load();
});
