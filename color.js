// Jack Morris 07/10/16

// globals
var img1 = document.getElementById("trump");
var img2 = document.getElementById("obama") ;
var imagePadding = 10;
var imageSize    = img1.width; // images must be squares of the same size

var ANIMATION_STEPS = 60;
var ANIMATION_DELAY = 30; // idfk

// create caches
var img1colors = [];
var img2colors = [];

// main function

function main() {

  var ctx = canvas.getContext("2d");
  
  ctx.drawImage(img1, imagePadding, imagePadding);
  ctx.drawImage(img2, imageSize + 2 * imagePadding, imagePadding);

  var img1data = ctx.getImageData(imagePadding, imagePadding, imageSize, imageSize).data;
  var img2data = ctx.getImageData(imageSize + 2 * imagePadding, imagePadding, imageSize, imageSize).data;

  // cache colors from img2

  for(var i = 0 ; i < img2data.length; i +=4 ) {
    var img2color = {};
    img2color.color = [img2data[i + 0], img2data[i + 1], img2data[i + 2]];
    img2color.alpha = img2data[i + 3];

    var x = i / 4;
    img2color.x = x % imageSize;
    img2color.y = parseInt( x / imageSize );

    img2colors.push( img2color );
  }

  // match each color from img1 to its closest color from img2
    // @TODO: Fix the logic a bit so that this works with images of different sizes

  console.log('Matching colors to original image.');

  for(var i = 0 ; i < img1data.length; i += 4) {
    var img1color = {};

    var r = img1data[i + 0];
    var g = img1data[i + 1];
    var b = img1data[i + 2];

    img1color.color = [r,g,b];

    img1color.alpha = img1data[i + 3];

    var x = i / 4;
    img1color.x = parseInt( x % imageSize);
    img1color.y = parseInt( x / imageSize );

    var minColorX = -1;
    var minColorDiff = Number.MAX_SAFE_INTEGER ;

    // find closest color from img2
      // @TODO: optimize using a clever nearest-neighbor search

    for(var x = 0; x < img2colors.length; x++) {
      var img2color = img2colors[x];
      var c = img2color.color;
      var colorDiff = Math.sqrt( (c[0]-r)*(c[0]-r) + (c[1]-g)*(c[1]-g) + (c[2]-b)*(c[2]-b) );
      if(colorDiff < minColorDiff) {
        minColorDiff = colorDiff;
        minColorX = x;
      }
    }

    var closestColor = img2colors[minColorX];
    img2colors.splice( minColorX, 1 );

    // get destination point
    img1color.dx = closestColor.x;
    img1color.dy = closestColor.y;
    img1color.dc = closestColor.color;

    img1color.xstep = parseFloat(img1color.dx - img1color.x) / ANIMATION_STEPS;
    img1color.ystep = parseFloat(img1color.dy - img1color.y) / ANIMATION_STEPS;

    img1color.rstep = parseFloat(img1color.dc[0] - img1color.color[0]) / ANIMATION_STEPS;
    img1color.gstep = parseFloat(img1color.dc[1] - img1color.color[1]) / ANIMATION_STEPS;
    img1color.bstep = parseFloat(img1color.dc[2] - img1color.color[2]) / ANIMATION_STEPS;

    // for some reason i have to negate this
    img1color.alphastep = parseFloat( -1 * (img1color.alpha - closestColor.alpha) ) / ANIMATION_STEPS; 

    img1colors.push( img1color );
  }

  // set button method
  var button = document.getElementById("button");
  button.disabled = false;
  button.onclick = startAnimation;
}

// called to display the animation

function startAnimation() {

  // disable button
  var button = document.getElementById("button");
  button.disabled = true;

  // get canvas
  var ctx = canvas.getContext("2d");

  // move colors to respective locations

  function moveAnimationStep()
  { 
    
    if(ANIMATION_STEP_COUNT == 0) console.log('Animating pixel location changes.');

    // create array
    var imageData = ctx.createImageData(imageSize, imageSize);

    // iterate through colors
    for(var i = 0; i < img1colors.length; i++) {

      var c = img1colors[i];

      // move coords
      c.x += c.xstep;
      c.y += c.ystep;

      // put data to canvas
      var x = (parseInt(Math.round( c.y ) ) * imageSize * 4) + (parseInt( Math.round( c.x ) ) * 4);
      imageData.data[x + 0] = parseInt( Math.round( c.color[0] ) );
      imageData.data[x + 1] = parseInt( Math.round( c.color[1] ) );
      imageData.data[x + 2] = parseInt( Math.round( c.color[2] ) );

      imageData.data[x + 3] = parseInt( Math.round( c.alpha ) );
    }

    // put array to canvas
    ctx.putImageData( imageData, imagePadding, imagePadding );

    // end animation
    ANIMATION_STEP_COUNT += 1;
    if( ANIMATION_STEP_COUNT == ANIMATION_STEPS ) {
      // start second animatino
      ANIMATION_STEP_COUNT = 0;
      colorIntervalID = window.setInterval(colorAnimationStep, ANIMATION_DELAY);
      window.clearInterval(moveIntervalID);
    }
  }

  function colorAnimationStep() 
  {
  
    if(ANIMATION_STEP_COUNT == 0) console.log('Animating pixel color changes.');

    // create array
    var imageData = ctx.createImageData(imageSize, imageSize);

    // iterate through colors
    for(var i = 0; i < img1colors.length; i++) {

      var c = img1colors[i];

      // change color
      c.color[0] += c.rstep;
      c.color[1] += c.gstep;
      c.color[2] += c.bstep;

      // change alpha
      c.alpha += c.alphastep;

      // put data to canvas
      var x = (parseInt(Math.round( c.y ) ) * imageSize * 4) + (parseInt( Math.round( c.x ) ) * 4);
      imageData.data[x + 0] = parseInt( Math.round( c.color[0] ) );
      imageData.data[x + 1] = parseInt( Math.round( c.color[1] ) );
      imageData.data[x + 2] = parseInt( Math.round( c.color[2] ) );

      imageData.data[x + 3] = parseInt( Math.round( c.alpha ) );
    }

    // put array to canvas
    ctx.putImageData( imageData, imagePadding, imagePadding );

    ANIMATION_STEP_COUNT += 1;

    if( ANIMATION_STEP_COUNT == ANIMATION_STEPS ) {
      // start second animatino
      console.log('Ending animation.');
      window.clearInterval(colorIntervalID);
    }
  }

  // set animation delay
  var ANIMATION_STEP_COUNT = 0;
  var moveIntervalID = window.setInterval(moveAnimationStep, ANIMATION_DELAY);
  var colorIntervalID = -1;
}

// resize canvas by image size
var canvas    = document.getElementById("myCanvas");
canvas.width  = imagePadding * 3 + imageSize * 2;
canvas.height = imagePadding * 2 + imageSize;


// set load function
window.onload = main;