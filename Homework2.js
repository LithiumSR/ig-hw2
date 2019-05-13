"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [

    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];


var torsoId = 0;
var headId = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperFrontLegId = 2;
var leftLowerFrontLegId = 3;
var rightUpperFrontLegId = 4;
var rightLowerFrontLegId = 5;
var leftUpperHindLegId = 6;
var leftLowerHindLegId = 7;
var rightUpperHindLegId = 8;
var rightLowerHindLegId = 9;
var tailId = 11;

var tailWidth = 0.5;
var tailHeight = 3;
var torsoHeight = 7.0;
var torsoWidth = 2;
var upperArmHeight = 2.0;
var lowerArmHeight = 2.0;
var upperArmWidth = 0.5;
var lowerArmWidth = 0.5;
var upperLegWidth = 0.5;
var lowerLegWidth = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 2.0;
var headHeight = 2;
var headWidth = 1;

var numNodes = 12;
var numAngles = 12;
var angle = 0;


var theta = [90, 180, 90, 0, 45, 0, 45, 0, 90, 0, 0, 160];

var numVertices = 24;

var stack = [];

var figure = [];

for (var i = 0; i < numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch (Id) {

        case torsoId:
            m = rotate(theta[torsoId], 0, 1, 0);
            m = mult(m, rotate(90, 1, 0, 0))
            figure[torsoId] = createNode(m, torso, null, headId);
            break;

        case headId:
        case head1Id:
        case head2Id:
            m = translate(0.0, torsoHeight * 0.8 + headHeight * 0.5, -headWidth * 1.5);
            m = mult(m, rotate(theta[head1Id], 1, 0, 0))
            m = mult(m, rotate(theta[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[headId] = createNode(m, head, tailId, null);
            break;

        case tailId:
            m = translate(-(torsoWidth * 0.5 - tailWidth * 2), 0.9 * tailHeight - torsoWidth, 0.0);
            m = mult(m, rotate(theta[tailId], 1, 0, 0));
            figure[tailId] = createNode(m, tail, leftUpperFrontLegId, null);
            break;

        case leftUpperFrontLegId:

            m = translate((torsoWidth + upperArmWidth) * 0.5, 0.6 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperFrontLegId], 1, 0, 0));
            figure[leftUpperFrontLegId] = createNode(m, leftUpperFrontLeg, rightUpperFrontLegId, leftLowerFrontLegId);
            break;

        case rightUpperFrontLegId:

            m = translate(-(torsoWidth + upperArmWidth) * 0.5, 0.6 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperFrontLegId], 1, 0, 0));
            figure[rightUpperFrontLegId] = createNode(m, rightUpperFrontLeg, leftUpperHindLegId, rightLowerFrontLegId);
            break;

        case leftUpperHindLegId:

            m = translate((torsoWidth + upperLegWidth) * 0.5, 0.1 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperHindLegId], 1, 0, 0));
            figure[leftUpperHindLegId] = createNode(m, leftUpperHindLeg, rightUpperHindLegId, leftLowerHindLegId);
            break;

        case rightUpperHindLegId:

            m = translate(-(torsoWidth + upperLegWidth) * 0.5, 0.1 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperHindLegId], 1, 0, 0));
            figure[rightUpperHindLegId] = createNode(m, rightUpperHindLeg, null, rightLowerHindLegId);
            break;

        case leftLowerFrontLegId:

            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerFrontLegId], 1, 0, 0));
            figure[leftLowerFrontLegId] = createNode(m, leftLowerFrontLeg, null, null);
            break;

        case rightLowerFrontLegId:

            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerFrontLegId], 1, 0, 0));
            figure[rightLowerFrontLegId] = createNode(m, rightLowerFrontLeg, null, null);
            break;

        case leftLowerHindLegId:

            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerHindLegId], 1, 0, 0));
            figure[leftLowerHindLegId] = createNode(m, leftLowerHindLeg, null, null);
            break;

        case rightLowerHindLegId:

            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerHindLegId], 1, 0, 0));
            figure[rightLowerHindLegId] = createNode(m, rightLowerHindLeg, null, null);
            break;

    }

}

function traverse(Id) {

    if (Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();
    if (figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
    if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function tail() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tailHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(tailWidth, tailHeight, tailWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0, 0.5 * (headHeight - torsoWidth), 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperFrontLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerFrontLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperFrontLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerFrontLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperHindLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerHindLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperHindLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerHindLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}


function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);
}


function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}


window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0, 10.0, -10.0, 10.0, -10.0, 10.0);
    modelViewMatrix = mat4();


    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    vBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    document.getElementById("slider0").onchange = function (event) {
        theta[torsoId] = event.target.value;
        initNodes(torsoId);
    };
    document.getElementById("slider1").onchange = function (event) {
        theta[head1Id] = event.target.value;
        initNodes(head1Id);
    };

    document.getElementById("slider2").onchange = function (event) {
        theta[leftUpperFrontLegId] = event.target.value;
        initNodes(leftUpperFrontLegId);
    };
    document.getElementById("slider3").onchange = function (event) {
        theta[leftLowerFrontLeg] = event.target.value;
        initNodes(leftLowerFrontLeg);
    };

    document.getElementById("slider4").onchange = function (event) {
        theta[rightUpperFrontLegId] = event.target.value;
        initNodes(rightUpperFrontLegId);
    };
    document.getElementById("slider5").onchange = function (event) {
        theta[rightLowerFrontLegId] = event.target.value;
        initNodes(rightLowerFrontLegId);
    };
    document.getElementById("slider6").onchange = function (event) {
        theta[leftUpperHindLegId] = event.target.value;
        initNodes(leftUpperHindLegId);
    };
    document.getElementById("slider7").onchange = function (event) {
        theta[leftLowerHindLegId] = event.target.value;
        initNodes(leftLowerHindLegId);
    };
    document.getElementById("slider8").onchange = function (event) {
        theta[rightUpperHindLegId] = event.target.value;
        initNodes(rightUpperHindLegId);
    };
    document.getElementById("slider9").onchange = function (event) {
        theta[rightLowerHindLegId] = event.target.value;
        initNodes(rightLowerHindLegId);
    };
    document.getElementById("slider10").onchange = function (event) {
        theta[tailId] = event.target.value;
        initNodes(tailId);
    };
    for (i = 0; i < numNodes; i++) initNodes(i);
    render();
}


var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT);
    traverse(torsoId);
    requestAnimFrame(render);
}