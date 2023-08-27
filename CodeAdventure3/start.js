"use strict";
var stage = null;
var imgSleeper = null;
var imgNails = null;

var schwellenHöhe = 0;
var schwellenBreite = 0;
var schwellenGap = 0;
var rail_offset = 0;

const TRACK_SCALE = 0.1;
const grid = 400;

$(() => {
    $(window).resize(() => {
        $(myCanvas)
            .attr("height", $(CanvasContainer).height() - 5)
            .attr("width", $(CanvasContainer).width());
    });
    $(myCanvas)
        .attr("height", $(CanvasContainer).height() - 5)
        .attr("width", $(CanvasContainer).width());
    stage = new createjs.Stage(myCanvas);

    imgNails = new Image();
    imgNails.src = "nail.png";
    imgSleeper = new Image();
    imgSleeper.src = "sleeper.png";

    schwellenHöhe = imgSleeper.width * TRACK_SCALE;
    schwellenBreite = imgSleeper.height * TRACK_SCALE;
    schwellenGap = schwellenBreite * 1.4;
    rail_offset = (schwellenHöhe ) / 5;

    setTimeout(() => {
        drawEverything();
    }, 100);

    //DrawCircle(0, 45, w / 2, h / 2, 700, context);

    /* $(settings).append(
        addSlider("startDeg", 0, 360, startDeg, (e) => {
            startDeg = parseInt(e.target.value);
            drawEverything();
        })
    );
    $(settings).append(
        addSlider("endDeg", 0, 360, endDeg, (e) => {
            endDeg = parseInt(e.target.value);
            drawEverything();
        })
    );
    $(settings).append(
        addSlider("radius", 200, 1000, radius, (e) => {
            radius = parseInt(e.target.value);
            drawEverything();
        })
    ); */
});

function addSlider(text, min, max, value, onChange) {
    const id = "slider" + (Math.random() * 100).toFixed();
    return $("<div>").append([$("<label>", { for: id }).text(text), $("<input>", { id: id, type: "range", min: min, max: max, value: value }).on("input", onChange)]);
}

function drawEverything() {
    stage.removeAllChildren();
    const w = myCanvas.width;
    const h = myCanvas.height;

    /* const image_width = imgSleeper.width * 0.5;

    const shape = new createjs.Shape();
    shape.graphics.beginFill("#f00").drawCircle(w / 2, h / 2, 5);
    stage.addChild(shape);
    //DrawImagesInCircle(315, 360, w / 2, h / 2, 300, 5, img);
    DrawImagesInCircle(startDeg, startDeg + 45, w / 2, h / 2, radius, 5, imgSleeper, image_width / -2);
    DrawImagesInCircle(startDeg, startDeg + 45, w / 2, h / 2, radius, 5, imgNails, image_width / -2 + 20);
    DrawImagesInCircle(startDeg, startDeg + 45, w / 2, h / 2, radius, 5, imgNails, image_width / 2 - 60);

    drawArc(startDeg, startDeg + 350, w / 2, h / 2, radius, "#000", 10, 0);
    drawArc(startDeg, startDeg + 350, w / 2, h / 2, radius, "#fff", 5, 0);
    //drawArc(startDeg, startDeg + 45, w / 2 + 60, h / 2, radius + 60, "#000", 5); */

    /* drawArc(45, { x: 100, y: 300 }, { x: 165, y: 335 }, "#000", 2);
    drawArc(45, { x: 100, y: 100 }, { x: 165, y: 65 }, "#000", 2);

    drawArc(45, { x: 300, y: 300 }, { x: 170, y: 335 }, "#000", 2);
    drawArc(45, { x: 100, y: 100 }, { x: 170, y: 65 }, "#000", 2); */

    drawCurvedRail({ x: 300, y: 300 }, 0, 45);
     drawCurvedRail({ x: 300, y: 200 }, 0, -45);
    /*drawCurvedRail({ x: 500, y: 300 }, 45, 0);
    drawCurvedRail({ x: 500, y: 200 }, -45, 0); */

    stage.update();
}

function drawCurvedRail(location, startDeg, endDeg) {
    let y1 = location.y,
        y2 = location.y,
        clockwise = 0;
    if (startDeg == 0 && endDeg == 45) {
        y2 = location.y + grid / 2;
        clockwise = 1;
    } else if (startDeg == 0 && endDeg == -45) {
        y2 = location.y - grid / 2;
        clockwise = 0;
    } else if (startDeg == 45 && endDeg == 0) {
        y1 = location.y - grid / 2;
        clockwise = 0;
    } else if (startDeg == -45 && endDeg == 0) {
        y1 = location.y + grid / 2;
        clockwise = 1;
    }
DrawImagesInCircle(45, clockwise, { x: location.x - grid / 2, y: y1 }, { x: location.x + grid / 2, y: y2 }, 10, imgSleeper, -schwellenHöhe / 2);
    drawArc(45, clockwise, { x: location.x - grid / 2, y: y1 }, { x: location.x + grid / 2, y: y2 }, "#000", 2, -schwellenHöhe / 2 + rail_offset);
    drawArc(45, clockwise, { x: location.x - grid / 2, y: y1 }, { x: location.x + grid / 2, y: y2 }, "#000", 2, schwellenHöhe / 2 - rail_offset);

    
}

function drawArc(deg, clockwise, p1, p2, color, thickness, offset = 0) {
    // Define the desired angle in radians
    let desiredAngle = deg2rad(deg);

    // Calculate the distance between the two points
    let distance = geometry.distance(p1, p2);

    // Calculate the radius of the circle
    let radius = distance / 2 / Math.sin(desiredAngle / 2);

    let h = Math.sqrt(Math.pow(radius, 2) - Math.pow(distance / 2, 2));

    if (clockwise) h *= -1;

    // Calculate the angle between the x-axis and the line connecting the two points
    let lineAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

    //let pointC = geometry.perpendicular(midpoint, lineAngle, h);
    let pointC = perpendicular2(p1, p2, h);
    //drawPoint(pointC, "pC", "#000", 3);

    //drawLine(midpoint, pointC);

    // Calculate the starting and ending angles for drawing the circular curve
    if (!clockwise) lineAngle += Math.PI;
    let startAngle = lineAngle - desiredAngle / 2 - Math.PI / 2;
    let endAngle = desiredAngle + startAngle;

    const shape = new createjs.Shape();
    shape.graphics
        .setStrokeStyle(thickness)
        .beginStroke(color)
        .arc(pointC.x, pointC.y, radius + offset, startAngle, endAngle);
    stage.addChild(shape);
}

function DrawImagesInCircle(deg, clockwise, p1, p2, numOfItems, img, offset = 0) {
    // Define the desired angle in radians
    let desiredAngle = deg2rad(deg);
    const steps = desiredAngle / numOfItems;

    // Calculate the distance between the two points
    let distance = geometry.distance(p1, p2);

    // Calculate the radius of the circle
    let radius = distance / 2 / Math.sin(desiredAngle / 2);

    let h = Math.sqrt(Math.pow(radius, 2) - Math.pow(distance / 2, 2));

    if (clockwise) h *= -1;
   
    // Calculate the angle between the x-axis and the line connecting the two points
    let lineAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

    //let pointC = geometry.perpendicular(midpoint, lineAngle, h);
    let pointC = perpendicular2(p1, p2, h);
    //drawPoint(pointC, "pC", "#000", 3);

    //drawLine(midpoint, pointC);

    // Calculate the starting and ending angles for drawing the circular curve
    if (!clockwise) lineAngle += Math.PI;
    let startAngle = lineAngle - desiredAngle / 2 - Math.PI / 2;
    let endAngle = desiredAngle + startAngle;

    for (let rad = startAngle; rad < endAngle; rad += steps) {
        stage.addChild(
            new createjs.Bitmap(img).set({
                x: pointC.x + Math.cos(rad) * (radius + offset),
                y: pointC.y + Math.sin(rad) * (radius + offset),
                scale: TRACK_SCALE,
                rotation: (rad * 180) / Math.PI,
            })
        );
    }
}

/* function DrawImagesInCircle(start_deg, end_deg, center_x, center_y, radius, numOfItems, img, offset = 0) {
    let rad = start_deg * (Math.PI / 180);
    const steps = Math.abs(start_deg - end_deg) / numOfItems;

    const offsetx = Math.cos(rad) * radius;
    const offsety = Math.sin(rad) * radius;

    for (let degrees = start_deg; degrees < end_deg; degrees += steps) {
        rad = degrees * (Math.PI / 180);

        stage.addChild(
            new createjs.Bitmap(img).set({
                x: center_x - offsetx + Math.cos(rad) * (radius + offset),
                y: center_y - offsety + Math.sin(rad) * (radius + offset),
                scale: 0.5,
                rotation: degrees,
            })
        );
    }
    stage.update();
} */

function perpendicular2(p1, p2, h) {
    let midpoint = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
    };

    let lineAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    lineAngle += Math.PI / 2;

    let x = Math.cos(lineAngle) * h;
    let y = Math.sin(lineAngle) * h;

    return { x: midpoint.x - x, y: midpoint.y - y };
}

function drawLine(p1, p2, color = "#000", size = 1) {
    let shape = new createjs.Shape();
    shape.graphics.setStrokeStyle(size, "round").beginStroke(color);
    shape.graphics.moveTo(p1.x, p1.y).lineTo(p2.x, p2.y);
    stage.addChild(shape);
}

function drawPoint(point, label, color = "#000", size = 5) {
    const s = new createjs.Shape();
    s.graphics.setStrokeStyle(1).beginStroke(color).beginFill(color).drawCircle(0, 0, size);
    s.x = point.x;
    s.y = point.y;

    stage.addChild(s);

    if (label) {
        const text = new createjs.Text(label, "Italic 12px Arial", color);
        text.x = point.x;
        text.y = point.y - 5;
        text.textBaseline = "alphabetic";
        stage.addChild(text);
    }
}

class Vector {
    x = 0;
    y = 0;
    length = 0;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.length = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    add(v) {
        return new Vector(v.x + this.x, v.y + this.y);
    }

    sub(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    mult(f) {
        return new Vector(f * this.x, f * this.y);
    }

    unit() {
        return this.mult(1 / this.length);
    }
}
