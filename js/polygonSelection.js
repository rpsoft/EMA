/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var fabricCanvas = null;

var selectedPoints = [];
var addingAnnotation = false;

var selectedAnnotation = null;  // I.e the last clicked polygon

var onlyOnce = false;
var globalDimensions;

/**
 * This function initialises the fabric canvases over the given "divselector". The image given is the image to be loaded unde the canvas. In this case any of the edwin morgan pages.
 *
 */
function initialiseImage() {

    $("#c").remove();
    $(".canvas-container").remove();
    $("#image_area").prepend('<canvas id="c" class="coveringCanvas"></canvas>');

    fabricCanvas = window._canvas = new fabric.Canvas('c');
    fabricCanvas.allowTouchScrolling = true;
    fabricCanvas.clear();

    $("#picture").load(function () {
        fabricCanvas.setHeight($("#picture").height());
        fabricCanvas.setWidth($("#picture").width());
        globalDimensions = {height: fabricCanvas.getHeight(), width: fabricCanvas.getWidth()};
    });

    $("#picture").on('mouse:over', function (e) {
        console.log(e.target);
    });

    // Interaction with polygons
    fabricCanvas.on('mouse:over', function (e) {
        if (e.target.type === 'polygon') {
            e.target.setFill('yellow');

            e.target.oldOpacity = e.target.opacity;
            e.target.setOpacity(0.25);
            fabricCanvas.renderAll();
            selectedAnnotation = e.target;
            $("#information_menu").html(e.target.uniqueId + " --> " + UID_2_SID[e.target.uniqueId.toLowerCase()]);
            $("#" + UID_2_SID[e.target.uniqueId.toLowerCase()]).addClass("hovered");
        }
        console.log(e.target);
    });

    fabricCanvas.on('mouse:out', function (e) {
        if (e.target.type === 'polygon') {
            e.target.setFill('blue');
            e.target.setOpacity(e.target.oldOpacity);
            fabricCanvas.renderAll();
            $("#" + UID_2_SID[e.target.uniqueId.toLowerCase()]).removeClass("hovered");
        }
    });


    fabricCanvas.observe("mouse:down", function (event) {

        if (event.target) {
            selectedAnnotation = event.target;

            $("#information_menu").html(event.target.uniqueId + " --> " + UID_2_SID[event.target.uniqueId.toLowerCase()]);

            if (!addingAnnotation) {
                $("#" + UID_2_SID[event.target.uniqueId.toLowerCase()]).click();
            }
            console.log('an object was clicked!: ' + event.target.type + " " + event.target.id);
        }

    });
    // End Interaction with polygons
}

/**
 * This is the point to be drawn when the user is clicking on the canvas when defining a new polygon.
 *
 * @param {type} fabricCanvas
 * @param {type} x
 * @param {type} y
 * @returns {undefined}
 */
function drawSelectionPoint(fabricCanvas, x, y) {
    var selectionPoint = new fabric.Circle({radius: 4, fill: '#ff0', top: y - 4, left: x - 4, selectable: false});
    console.log(selectionPoint.left + "/" + fabricCanvas.width + " -- " + selectionPoint.top + " / " + fabricCanvas.height);
    fabricCanvas.add(selectionPoint);
    selectedPoints.push(selectionPoint);
}

/**
 * enables annotation mode to prevent other behaviour when clicking and so on.
 *
 * @returns {undefined}
 */
function addAnnotation() {
    addingAnnotation = true;
}


/**
 * Cancels the current polygon being built, clearing out the array of already defined points.
 *
 * @returns {undefined}
 */
function stopAnnotation() {
    addingAnnotation = false;
    while (selectedPoints.length > 0) {
        var point = selectedPoints.pop();
        fabricCanvas.remove(point);
    }
    selectedPoints = [];
}


/**
 * Simple function to draw a polygon
 * @param {type} points
 * @param {type} segment
 * @returns {undefined}
 */
function justDrawPolygon(points, segment) {
    var segmentID = $("#side_menu_area").children().length;

    var selected_risk = parseInt($("#risk_slider").val());
    var risk;

    switch (segment.risk_rating) {
        case "Low":
            risk = 0;
            break;
        case "Medium":
            risk = 1;
            break;
        case "High":
            risk = 2;
            break;
        default :
            risk = 100; // Never show, as it could be an ULTRA RISK case.
    }

    var opa = 0.01;

    if (risk > selected_risk) {
        opa = 1.0;
    }
    if ($("#hideAnnotationsSwitch").prop('checked') === true ){
        opa = 0.0;// alert("really");
    }

    currentShape = new fabric.Polygon(
            points, {
                fill: 'blue',
                opacity: opa,
                selectable: false,
                lockMovementY: true,
                lockMovementX: true,
                lockScalingX: true,
                lockScalingY: true,
                hasControls: true,
                id: segmentID,
                perPixelTargetFind: true,
                uniqueId: segment.reference
            });

    fabricCanvas.add(currentShape);
}


var newAnnotationsCount = 0;
function drawPolygon(fabricCanvas, points, relpoints) {
    addingAnnotation = false;
    var polygonPoints = [];
    if (points === undefined) {
        // alert("new ppoints");
        while (selectedPoints.length > 0) {
            var point = selectedPoints.pop();
            polygonPoints.push({x: point.left + 4, y: point.top + 4});
            fabricCanvas.remove(point);
        }

    } else {
        polygonPoints = translatePoints(relPoints);
    }

    var segmentID = $("#side_menu_area").children().length;

    currentShape = new fabric.Polygon(
            polygonPoints, {
                fill: 'blue',
                opacity: 0.2,
                selectable: false,
                lockMovementY: true,
                lockMovementX: true,
                lockScalingX: true,
                lockScalingY: true,
                hasControls: true,
                perPixelTargetFind: true,
                id: segmentID
            });



    if (relpoints !== undefined) {
        currentShape.relPoints = relpoints;
    } else {
        currentShape.relPoints = getRelativePoints(polygonPoints);
    }

    $(document).on("annotationCreated", function (eventData) {

        if (onlyOnce) { // hack... the event was being triggered more than once, and I don't understand why.
            //var g = getRelativePoints(eventData.polygon.points);
            var segmentID = $("#side_menu_area").children().length;
            eventData.polygon.uniqueId = "lastAnnotation-" + newAnnotationsCount;

            var cropData = getPolygonCrop(eventData.polygon, eventData.polygon.uniqueId);


            UID_2_SID[eventData.polygon.uniqueId.toLowerCase()] = "segment-" + segmentID;
            SID_2_UID["segment-" + segmentID] = eventData.polygon.uniqueId.toLowerCase();

            newAnnotationsCount++;

            activeAnnotation = {segmenID: segmentID, geometry: eventData.polygon, text: "new annotation"};
            $("#information_menu").html(activeAnnotation.segmentID);

            drawMini(cropData, eventData.polygon.uniqueId);
            onlyOnce = false;
        }

    });

    onlyOnce = true;

    $.event.trigger({type: "annotationCreated",
        polygon: currentShape,
        time: new Date()});

    name++;
    fabricCanvas.add(currentShape);

}


function getBoundingBox(points) {
    var minX = 1000000;
    var maxX = 0;
    var minY = 10000000;
    var maxY = 0;

    for (p in points) {
        var point = points[p];
        if (point.x > maxX) {
            maxX = point.x;
        }

        if (point.x < minX) {
            minX = point.x;
        }

        if (point.y > maxY) {
            maxY = point.y;
        }

        if (point.y < minY) {
            minY = point.y;
        }
    }

    return {minX: minX, maxX: maxX, minY: minY, maxY: maxY, height: (maxY - minY), width: (maxX - minX)};


}


var imageDataCache = [];
function getPolygonCrop(polygon, segmentId) {

    if (polygon.width < 1) {
        return null;
    }

    var imageData = imageDataCache[segmentId];
    if (imageData !== null && imageData !== undefined && segmentId !== undefined) {
        return imageData;
    }

    if( polygon.relPoints === undefined || polygon.relPoints.length < 1){
        polygon.relPoints = getRelativePoints(polygon);
    }

    var BB = getBoundingBox(polygon.relPoints);
    var x = BB.minX * fabricCanvas.width;
    var y = BB.minY * fabricCanvas.height;
    var xsize = BB.width * fabricCanvas.width;
    var ysize = BB.height * fabricCanvas.height;

    var imgData = cropping_ctx.getImageData(x*2, y*2, xsize*2, ysize*2);

    var newPoints = relToAbsPoints(polygon.relPoints, cropping_canvas.width, cropping_canvas.height);

    for (var i = 0; i < imgData.data.length; i += 4)
    {
        var x = ((i / 4) % imgData.width) + Math.floor(newPoints.minX);
        var y = (Math.floor((i / 4) / imgData.width)) + Math.floor(newPoints.minY);

        if (!isPointInPoly(newPoints.points, {x: x, y: y})) {
            imgData.data[i + 0] = 255;
            imgData.data[i + 1] = 255;
            imgData.data[i + 2] = 255;
//             imgData.data[i+3]=255;
        }
    }


    crop_canvas = document.createElement('canvas');

    crop_canvas.height = ysize*2;
    crop_canvas.width = xsize*2;

    crop_ctx = crop_canvas.getContext("2d");
    crop_ctx.putImageData(imgData, 0, 0);

    imgData.URL = crop_canvas.toDataURL();
    imageDataCache[segmentId] = imgData;
    return imgData;
}


function isPointInPoly(poly, pt) {
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
                && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
                && (c = !c);
    return c;
}


function getRelativePoints(geometry) {
    var relpoints = [];
    var points = geometry.points;
    for (var p in points) {
        point = points[p];

        if ( geometry.Xres === undefined){
            relpoints.push({x: point.x / 1658, y: point.y / 1387});
        } else {
            relpoints.push({x: point.x / geometry.Xres, y: point.y / geometry.Yres});
        }
    }


    return relpoints;
}

function relToAbsPoints(relpoints, width, height) {
    var points = [];
    var minx = 900000;
    var miny = 900000;

    for (var p in relpoints) {
        var point = relpoints[p];
        var x = point.x * width;
        var y = point.y * height;

        if (x < minx) {
            minx = x;
        }

        if (y < miny) {
            miny = y;
        }

        points.push({x: x, y: y});
    }

    return {points: points, minX: minx, minY: miny};
}
