// Jack Morris 07/10/16

function main() {
  var imagePadding = 10;
  var imageSize   = 64; // px

  var ANIMATION_STEPS = 10;
  var ANIMATION_DELAY = 1000; // idfk

  var canvas = document.getElementById("myCanvas");
  var ctx = canvas.getContext("2d");
  
  var img1 = document.getElementById("sand");
  ctx.drawImage(img1, imagePadding, imagePadding);

  var img2 = document.getElementById("slime");
  ctx.drawImage(img2, imageSize + 2 * imagePadding, imagePadding);

  var img1data = ctx.getImageData(imagePadding, imagePadding, imageSize, imageSize).data;
  var img2data = ctx.getImageData(imageSize + 2 * imagePadding, imagePadding, imageSize, imageSize).data;

  console.log('img1data:',img1data);

  // create caches

  var img1colors = [];
  var img2colors = [];

  // cache colors from img2

  console.log('Caching colors from destination image.');

  for(var i = 0 ; i < img2data.length; i +=4 ) {
    var img2color = {};
    img2color.color = [img2data[i + 0], img2data[i + 1], img2data[i + 2]];

    img2color.alpha = img2data[i + 3];

    var x = i / 4;
    img2color.x = x % imageSize;
    img2color.y = parseInt( x / imageSize );

    img2colors.push( img2color );
  }

  console.log('img1data.length:',img1data.length,'img2data.length:',img2data.length,'img2colors.length:',img2colors.length);

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
    var c1Total = Math.sqrt(r*r + g*g + b*b);
    var minColorDiff = c1Total;

    // find closest color from img2
      // @TODO: optimize using a clever nearest-neighbor search

    for(var x = 0; x < img2colors.length; x++) {
      var img2color = img2colors[x];
      var c = img2color.color;
      var c2Total = Math.sqrt(c[0]*c[0] + c[1]*[1] + c[1]*c[1]);
      var c2Diff = Math.abs( c1Total - c2Total );
      if(c2Diff < minColorDiff) {
        minColorDiff = c2Diff;
        minColorX = x;
      }
    }

    if(minColorX == -1) {
      console.log('img2colors:',img2colors);
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

    img1colors.push( img1color );
  }

  // move colors to respective locations

  console.log('Animating colors to new locations');

  function animationStep()
  { 
    // create array
    var imageData = ctx.createImageData(imageSize, imageSize);

    for(var i = 0; i < imageSize * imageSize * 4; i++) {
      imageData.data[i] = 0;
    }

    // iterate through colors
    for(var i = 0; i < img1colors.length; i++) {

      var c = img1colors[i];
      // increment coords
      c.x += c.xstep;
      c.y += c.ystep;

      // change color
      c.color[0] += c.rstep;
      c.color[1] += c.gstep;
      c.color[2] += c.bstep;

      // put data to canvas
      var x = (parseInt(c.x) * imageSize * 4) + (parseInt(c.y) * 4);
      imageData.data[x + 0] = parseInt( c.color[0] );
      imageData.data[x + 1] = parseInt( c.color[1] );
      imageData.data[x + 2] = parseInt( c.color[2] );
      imageData.data[x + 3] = 255 ; // alpha, for now this is fine

      // end animation
      ANIMATION_STEP_COUNT += 1;
      if( ANIMATION_STEP_COUNT == ANIMATION_STEPS ) {
        window.clearInterval(intervalID);
      }
    }

    // put array to canvas
    console.log(imageData, imagePadding, imagePadding, 0, 0, imageSize, imageSize);
    ctx.putImageData(imageData, 0, 0 );// , 0, 0, imageSize, imageSize);
  }

  // set animation delay
  var ANIMATION_STEP_COUNT = 0;
  var intervalID = window.setInterval(animationStep, ANIMATION_DELAY)
}

window.onload = main;