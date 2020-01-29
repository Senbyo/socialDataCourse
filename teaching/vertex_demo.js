main();

//
// Start here
//
function main() {
  const canvas = document.getElementById('glcanvas');
  const gl = canvas.getContext('webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

//   const vsSource = `
//     attribute vec4 aVertexPosition;
//     attribute vec4 aVertexColor;
//     uniform mat4 uModelViewMatrix;
//     uniform mat4 uProjectionMatrix;
//     varying lowp vec4 vColor;
//     void main(void) {
//       gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
//       vColor = aVertexColor;
//     }
//   `;

//   // Fragment shader program

//   const fsSource = `
//     varying lowp vec4 vColor;
//     void main(void) {
//       gl_FragColor = vColor;
//     }
//   `;

//   // Initialize a shader program; this is where all the lighting
//   // for the vertices and so forth is established.
//   const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

//   // Collect all the info needed to use the shader program.
//   // Look up which attributes our shader program is using
//   // for aVertexPosition, aVevrtexColor and also
//   // look up uniform locations.
//   const programInfo = {
//     program: shaderProgram,
//     attribLocations: {
//       vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
//       vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
//     },
//     uniformLocations: {
//       projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
//       modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
//     },
//   };

//   // Here's where we call the routine that builds all the
//   // objects we'll be drawing.
//   const buffers = initBuffers(gl);

//   // Draw the scene
//   drawScene(gl, programInfo, buffers);


    // Set clear color to black, fully opaque
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

}

