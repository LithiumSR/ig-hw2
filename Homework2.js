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


var useAnimation = true;
var useTexture = true;
var isJumping = false;
var isDescending = false;
var eye;
var scale = 2;
var radius = 1.0
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
var alpha = -7.09;
var beta = 0.2;
var torsoRotation = 90.0;
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
var headUpperId = 12;
var groundId = 13;
var baseObstacleId = 14;
var cross1Id = 15;
var cross2Id = 16;
var upRightObstacleWidthId = 17;
var upLeftObstacleWidthId = 18;
var upHorizontalObstacleId = 19;

var tailWidth = 0.5 / scale;
var tailHeight = 3 / scale;
var torsoHeight = 7.0 / scale;
var torsoWidth = 2 / scale;
var upperArmHeight = 2.0 / scale;
var lowerArmHeight = 2.0 / scale;
var upperArmWidth = 0.5 / scale;
var lowerArmWidth = 0.5 / scale;
var upperLegWidth = 0.5 / scale;
var lowerLegWidth = 0.5 / scale;
var lowerLegHeight = 2.0 / scale;
var upperLegHeight = 2.0 / scale;
var headHeight = 1.1 / scale;
var headWidth = 1 / scale;
var upperHeadHeight = 2.3 / scale;
var upperHeadWidth = 1 / scale;
var baseObstacleHeigth = 0.3;
var baseObstacleWidth = 4;
var groundWidth = 10;
var numNodes = 20;
var numAngles = 20;
var angle = 0;
var disableJump = false;

var texture1, texture2, texture3, texture2_alt;
var texSize = 256;
var numChecks = 8;
var c;

//legs
var leftLowerLegFlag = false;
var leftUpperLegFlag = false;

var rightLowerLegFlag = false;
var rightUpperLegFlag = false;

//arms
var leftLowerFrontLegFlag = false;
var leftUpperFrontLegFlag = false;

var rightLowerFrontLegFlag = false;
var rightUpperFrontLegFlag = false;
var zoom = 15;
var translationOverX = -zoom;
var translationOverY = 0.0;
var theta = [90, 90, 90, 0, 90, 0, 110, 0, 90, 0, 0, 160, 105, 0, 0, 15, 345, 90, 90, 90];

var numVertices = 24;

var stack = [];

var figure = [];

for (var i = 0; i < numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var texCoordsArray = [];
var pointsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0), // black
    vec4(1.0, 0.0, 0.0, 1.0), // red
    vec4(1.0, 1.0, 0.0, 1.0), // yellow
    vec4(0.0, 1.0, 0.0, 1.0), // green
    vec4(0.0, 0.0, 1.0, 1.0), // blue
    vec4(1.0, 0.0, 1.0, 1.0), // magenta
    vec4(0.0, 1.0, 1.0, 1.0), // white
    vec4(0.0, 1.0, 1.0, 1.0) // cyan
];

var image1 = new Uint8Array(4 * texSize * texSize);
var image2 = new Uint8Array(4 * texSize * texSize);
var image3 = new Uint8Array(4 * texSize * texSize);
for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        var patchx = Math.floor(i / (texSize / numChecks));
        var patchy = Math.floor(j / (texSize / numChecks));
        if (patchx % 2 ^ patchy % 2) c = 255;
        else c = 0;
        // Clean texture
        image1[4 * i * texSize + 4 * j] = c;
        image1[4 * i * texSize + 4 * j + 1] = c;
        image1[4 * i * texSize + 4 * j + 2] = c;
        image1[4 * i * texSize + 4 * j + 3] = 255;
        // Black texture
        image3[4 * i * texSize + 4 * j] = 0;
        image3[4 * i * texSize + 4 * j + 1] = 0;
        image3[4 * i * texSize + 4 * j + 2] = 0;
        image3[4 * i * texSize + 4 * j + 3] = 255;
    }
}
for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        var v = 0;
        var patchx = Math.floor(i / (texSize / numChecks));
        var patchy = Math.floor(j / (texSize / numChecks));
        if (patchx % 2 ^ patchy % 2) v = i;
        // Linear increase texture
        image2[4 * i * texSize + 4 * j] = v;
        image2[4 * i * texSize + 4 * j + 1] = v;
        image2[4 * i * texSize + 4 * j + 2] = v;
        image2[4 * i * texSize + 4 * j + 3] = 255;

    }
}


function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}


function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}


function configureTexture() {
    texture1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    texture2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    //Flipped version of texture2
    texture2_alt = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture2_alt);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    texture3 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture3);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image3);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

function initNodes(Id) {

    var m = mat4();

    switch (Id) {
        case torsoId:
            m = translate(translationOverX, 5 + translationOverY, 0);
            m = mult(m, rotate(theta[torsoId], 0, 1, 0));
            m = mult(m, rotate(torsoRotation, 1, 0, 0))
            figure[torsoId] = createNode(m, torso, groundId, headId);
            break;

        case headId:
        case head1Id:
        case head2Id:
            m = translate(0.0, torsoHeight * 0.8 + headHeight * 0.82, -headWidth * 0.55);
            m = mult(m, rotate(theta[head1Id], 1, 0, 0))
            m = mult(m, rotate(theta[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[headId] = createNode(m, head, tailId, headUpperId);
            break;
        case headUpperId:
            m = translate(0.0, -torsoHeight + upperHeadHeight * 2.6, upperHeadWidth * 0.5);
            m = mult(m, rotate(theta[headUpperId], 1, 0, 0))
            m = mult(m, rotate(theta[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * upperHeadHeight, 0.0));
            figure[headUpperId] = createNode(m, headUpper, null, null);
            break;

        case tailId:
            m = translate(-(torsoWidth * 0.5 - tailWidth * 2), 0.9 * tailHeight - torsoWidth, -torsoHeight * 0.1);
            m = mult(m, rotate(theta[tailId], 1, 0, 0));
            figure[tailId] = createNode(m, tail, leftUpperFrontLegId, null);
            break;

        case leftUpperFrontLegId:

            m = translate((torsoWidth + upperArmWidth) * 0.5, 0.8 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperFrontLegId], 1, 0, 0));
            figure[leftUpperFrontLegId] = createNode(m, leftUpperFrontLeg, rightUpperFrontLegId, leftLowerFrontLegId);
            break;

        case rightUpperFrontLegId:

            m = translate(-(torsoWidth + upperArmWidth) * 0.5, 0.8 * torsoHeight, 0.0);
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
            m = mult(m, rotate(theta[leftLowerFrontLegId], 1, 0, 0));
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

        case groundId:
            m = translate(1, -2.15, 2);
            m = mult(m, rotate(theta[groundId], 1, 0, 0));
            figure[groundId] = createNode(m, baseGround, baseObstacleId, null);
            break;
        case baseObstacleId:
            m = translate(0.0, baseObstacleHeigth + 3, 0.0);
            m = mult(m, rotate(theta[baseObstacleId], 1, 0, 0));
            figure[baseObstacleId] = createNode(m, obstacleElem, null, upRightObstacleWidthId);
            break;
        case upHorizontalObstacleId:
            m = translate(0.0, -baseObstacleWidth * 0.45, -baseObstacleHeigth * 1.7);
            m = mult(m, rotate(theta[upHorizontalObstacleId], 1, 0, 0));
            figure[upHorizontalObstacleId] = createNode(m, obstacleElem, null, null);
            break;
        case cross1Id:
            m = translate(0.0, baseObstacleHeigth * 2.2, 0.0);
            m = mult(m, rotate(theta[cross1Id], 1, 0, 0));
            figure[cross1Id] = createNode(m, crossElem, cross2Id, null);
            break;
        case cross2Id:
            m = translate(0.0, baseObstacleHeigth * 2.2, 0.0);
            m = mult(m, rotate(theta[cross2Id], 1, 0, 0));
            figure[cross2Id] = createNode(m, crossElem, null, null);
            break;

        case upRightObstacleWidthId:
            m = translate(0.0, baseObstacleHeigth * 3.6, baseObstacleWidth * 0.45);
            m = mult(m, rotate(theta[upRightObstacleWidthId], 1, 0, 0));
            figure[upRightObstacleWidthId] = createNode(m, obstacleElem2, upLeftObstacleWidthId, upHorizontalObstacleId);
            break;

        case upLeftObstacleWidthId:
            m = translate(0.0, baseObstacleHeigth * 3.6, -baseObstacleWidth * 0.5);
            m = mult(m, rotate(theta[upLeftObstacleWidthId], 1, 0, 0));
            figure[upLeftObstacleWidthId] = createNode(m, obstacleElem2, cross1Id, null);
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
    gl.uniform1i(gl.getUniformLocation(program, "isTorso"), true);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        if (i == 3) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture1);
        } else if (i == 2) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture3);
        } else if (i == 4) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture2_alt);
        } else {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture2);
        }
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "isTorso"), false);
}

function headUpper() {

    instanceMatrix = mult(modelViewMatrix, translate(0, 0.5 * (upperHeadHeight - torsoWidth), 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperHeadWidth, upperHeadHeight, upperHeadWidth));
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

function baseGround() {
    gl.uniform1i(gl.getUniformLocation(program, "isGround"), true);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * groundWidth, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(groundWidth + 25, 0.5, groundWidth))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    gl.uniform1i(gl.getUniformLocation(program, "isGround"), false);
}

function obstacleElem() {
    if (disableJump) return;
    gl.uniform1i(gl.getUniformLocation(program, "isObstacle"), true);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * baseObstacleHeigth, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(baseObstacleWidth * 0.1, baseObstacleHeigth, baseObstacleWidth))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    gl.uniform1i(gl.getUniformLocation(program, "isObstacle"), false);
}

function crossElem() {
    if (disableJump) return;
    gl.uniform1i(gl.getUniformLocation(program, "isObstacle"), true);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * baseObstacleHeigth, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(baseObstacleWidth * 0.1, baseObstacleHeigth, baseObstacleWidth))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    gl.uniform1i(gl.getUniformLocation(program, "isObstacle"), false);

}

function obstacleElem2() {
    if (disableJump) return;
    gl.uniform1i(gl.getUniformLocation(program, "isObstacle"), true);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * baseObstacleHeigth, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(baseObstacleWidth * 0.1, baseObstacleHeigth, baseObstacleWidth * 0.55))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    gl.uniform1i(gl.getUniformLocation(program, "isObstacle"), false);
}




function animate() {
    //left hind leg
    if (theta[leftLowerHindLegId] < 0) {
        leftLowerLegFlag = false;
    } else if (theta[leftLowerHindLegId] >= 60) {
        leftLowerLegFlag = true;
    }

    if ((isJumping && translationOverX > -6.3 && !isDescending) && theta[leftLowerHindLegId] <= 80) {
        theta[leftLowerHindLegId] += 2.8;
    } else if (isDescending && translationOverX > 2 && theta[leftLowerHindLegId] > 80) theta[leftLowerHindLegId] -= 0.7;

    if (leftLowerLegFlag && !((isJumping && translationOverX > -6.3 && !isDescending))) {
        theta[leftLowerHindLegId] -= 0.6;
    } else if (!(isJumping && !isDescending)) theta[leftLowerHindLegId] += 0.6;

    if (theta[leftUpperHindLegId] < 65) {
        leftUpperLegFlag = false;
    } else if (theta[leftUpperHindLegId] >= 95) {
        leftUpperLegFlag = true;
    }

    if (leftUpperLegFlag) theta[leftUpperHindLegId] -= 0.4;
    else theta[leftUpperHindLegId] += 0.4;


    //right hind leg
    if (theta[rightLowerHindLegId] < -10) {
        rightLowerLegFlag = false;
    } else if (theta[rightLowerHindLegId] >= 70) {
        rightLowerLegFlag = true;
    }
    if ((isJumping && translationOverX > -6.3 && !isDescending) && theta[rightLowerHindLegId] <= 90) {
        theta[rightLowerHindLegId] += 2.8;
    } else if (isDescending && translationOverX > 2 && theta[rightLowerHindLegId] > 70) theta[rightLowerHindLegId] -= 0.7;

    if (!(isJumping && !isDescending) && rightLowerLegFlag) theta[rightLowerHindLegId] -= 0.6;
    else if (!(isJumping && !isDescending)) theta[rightLowerHindLegId] += 0.6;

    if (theta[rightUpperHindLegId] < 70) {
        rightUpperLegFlag = false;
    } else if (theta[rightUpperHindLegId] >= 110) {
        rightUpperLegFlag = true;
    }

    if (rightUpperLegFlag) theta[rightUpperHindLegId] -= 0.5;
    else theta[rightUpperHindLegId] += 0.5;


    //left front leg
    if (theta[leftLowerFrontLegId] < -30) {
        leftLowerFrontLegFlag = true;
    } else if (theta[leftLowerFrontLegId] >= 40) {
        leftLowerFrontLegFlag = false;
    }
    if ((isJumping && !isDescending) && theta[leftLowerFrontLegId] <= 90) {
        theta[leftLowerFrontLegId] += 1.1;
    } else if (isDescending && theta[leftLowerFrontLegId] > 70) theta[leftLowerFrontLegId] -= 0.7;

    if (leftLowerFrontLegFlag) {
        theta[leftLowerFrontLegId] += 0.6;
    } else if (!(isJumping && !isDescending)) theta[leftLowerFrontLegId] -= 0.6;

    if (theta[leftUpperFrontLegId] < 60) {
        leftUpperFrontLegFlag = false;
    } else if (theta[leftUpperFrontLegId] >= 110) {
        leftUpperFrontLegFlag = true;
    }

    if (leftUpperFrontLegFlag) theta[leftUpperFrontLegId] -= 0.5;
    else theta[leftUpperFrontLegId] += 0.5;


    //right front leg
    if (theta[rightLowerFrontLegId] < -40) {
        rightLowerFrontLegFlag = true;
    } else if (theta[rightLowerFrontLegId] >= 35) {
        rightLowerFrontLegFlag = false;
    }

    if ((isJumping && !isDescending) && theta[rightLowerFrontLegId] <= 90) {
        theta[rightLowerFrontLegId] += 1.3;
    } else if (isDescending && theta[rightLowerFrontLegId] > 70) theta[rightLowerFrontLegId] -= 0.7;

    if (rightLowerFrontLegFlag) theta[rightLowerFrontLegId] += 0.8;
    else if (!(isJumping && !isDescending)) theta[rightLowerFrontLegId] -= 0.8;

    if (theta[rightUpperFrontLegId] < 65) {
        rightUpperFrontLegFlag = false;
    } else if (theta[rightUpperFrontLegId] >= 95) {
        rightUpperFrontLegFlag = true;
    }

    if (rightUpperFrontLegFlag) theta[rightUpperFrontLegId] -= 0.2;
    else theta[rightUpperFrontLegId] += 0.2;
}

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    texCoordsArray.push(texCoord[0])
    pointsArray.push(vertices[b]);
    texCoordsArray.push(texCoord[1])
    pointsArray.push(vertices[c]);
    texCoordsArray.push(texCoord[2])
    pointsArray.push(vertices[d]);
    texCoordsArray.push(texCoord[3])
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
    gl.enable(gl.DEPTH_TEST);
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-zoom, zoom, -zoom, zoom, -zoom, zoom);
    modelViewMatrix = mat4();


    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();


    configureTexture();
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    document.getElementById("increaseAlpha").onclick = function (event) {
        alpha += 0.1
    };
    document.getElementById("decreaseAlpha").onclick = function (event) {
        alpha -= 0.1
    };

    document.getElementById("increaseBeta").onclick = function (event) {
        beta += 0.1
    };
    document.getElementById("decreaseBeta").onclick = function (event) {
        beta -= 0.1
    };

    document.getElementById("disableJump").onclick = function (event) {
        disableJump = !disableJump;
        var elem = document.getElementById("disableJump");
        translationOverX = -zoom;
        translationOverY = 0.0;
        isJumping = false;
        isDescending = false;
        torsoRotation = 90.0;
        theta = [90, 90, 90, 0, 90, 0, 110, 0, 90, 0, 0, 160, 105, 0, 0, 15, 345, 90, 90, 90];
        if (disableJump) {
            alpha = 0.0;
            beta = 0.0;
            elem.innerHTML = "Add obstacle";
        } else {
            alpha = -7.09;
            beta = 0.2;
            elem.innerHTML = "Remove obstacle";
        }
    };

    document.getElementById("useTexture").onclick = function () {
        useTexture = !useTexture;
        var elem = document.getElementById("useTexture");
        if (useTexture) {
            elem.innerHTML = "Disable texture";
        } else {
            elem.innerHTML = "Enable texture";
        }
    }

    document.getElementById("useAnimation").onclick = function () {
        useAnimation = !useAnimation;
        var elem = document.getElementById("useAnimation");
        if (useAnimation) {
            elem.innerHTML = "Disable animation";
        } else {
            elem.innerHTML = "Enable animation";
        }
    }

    for (i = 0; i < numNodes; i++) initNodes(i);


    render();
}


var render = function () {
    if (useAnimation) {
        animate();
        translationOverX += 0.05;
        if (!disableJump) {
            if (translationOverX > -0.7) {
                if (translationOverX > 1 && translationOverY <= 0.0) {
                    translationOverY = 0.0;
                    if (torsoRotation > 90.0) {
                        torsoRotation -= 0.1;
                    }

                    isJumping = false;
                    isDescending = false;
                } else {
                    translationOverY -= 0.05;
                    isDescending = true;
                    if (translationOverX > 0) {
                        torsoRotation += 0.25;
                    }
                }
            } else if (translationOverX > -7.3) {
                isJumping = true;
                translationOverY += 0.022;
                if (translationOverX < -5) torsoRotation -= 0.2;
            }
        }
        if (translationOverX > zoom) {
            torsoRotation = 90.0;
            translationOverX = -zoom;
            translationOverY = 0.0;
            theta = [90, 90, 90, 0, 90, 0, 110, 0, 90, 0, 0, 160, 105, 0, 0, 15, 345, 90, 90, 90];
        }

    }

    for (i = 0; i < numNodes; i++) initNodes(i);
    eye = vec3(radius * Math.sin(alpha), radius * Math.sin(beta), radius * Math.cos(alpha));
    modelViewMatrix = lookAt(eye, at, up);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), useTexture);
    gl.clear(gl.COLOR_BUFFER_BIT);
    traverse(torsoId);
    requestAnimFrame(render);
}