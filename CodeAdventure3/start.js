'use strict';
var stage = null;
var img = null;
var startDeg = 0, endDeg = 45;

$(() => {


    $(window).resize(() => {
        $(myCanvas).attr("height", $(CanvasContainer).height() - 5).attr("width", $(CanvasContainer).width());
    });
    $(myCanvas).attr("height", $(CanvasContainer).height() - 5).attr("width", $(CanvasContainer).width());
    stage = new createjs.Stage(myCanvas);

    img = new Image();
    img.onload = () => {
        drawEverything();
    };
    img.src = "sleeper.png";





    //DrawCircle(0, 45, w / 2, h / 2, 700, context);

    $(settings).append(addSlider("startDeg", 0, 360, startDeg, e => { startDeg = parseInt(e.target.value); drawEverything(); }))
    $(settings).append(addSlider("endDeg", 0, 360, endDeg, e => { endDeg = parseInt(e.target.value); drawEverything(); }))


});

function addSlider(text, min, max, value, onChange) {
    const id = "slider" + (Math.random() * 100).toFixed();
    return $("<div>").append([$("<label>", { for: id }).text(text),
    $("<input>", { id: id, type: "range", min: min, max: max, value: value }).on("input", onChange)]);
}

function drawEverything() {
    stage.removeAllChildren();
    if (startDeg > endDeg) return;
    const w = myCanvas.width;
    const h = myCanvas.height;

    const shape = new createjs.Shape();
    shape.graphics.beginFill("#f00").drawCircle(w / 2, h / 2, 5);
    stage.addChild(shape);
    //DrawImagesInCircle(315, 360, w / 2, h / 2, 300, 5, img);
    DrawImagesInCircle(startDeg, endDeg, w / 2, h / 2, 300, 5, img);
    drawArc(0, 45, w / 2, h / 2, 300, "#000", 5);
    drawArc(0, 45, w / 2 + 60, h / 2, 300 + 60, "#000", 5);

    stage.update();
}

function drawArc(start_deg, end_deg, center_x, center_y, radius, color, thickness) {
    const shape = new createjs.Shape();
    shape.graphics.setStrokeStyle(thickness).beginStroke(color).arc(center_x, center_y, radius, start_deg, (Math.PI / 180) * end_deg);
    stage.addChild(shape);
}

function DrawImagesInCircle(start_deg, end_deg, center_x, center_y, radius, numOfItems, img) {
    let rad = start_deg * (Math.PI / 180);
    const steps = Math.abs(start_deg - end_deg) / numOfItems

    const offsetx = Math.cos(rad) * radius;
    const offsety = Math.sin(rad) * radius;

    for (let degrees = start_deg; degrees < end_deg; degrees += steps) {
        rad = degrees * (Math.PI / 180);

        stage.addChild((new createjs.Bitmap(img)).set({
            x: center_x - offsetx + Math.cos(rad) * radius,
            y: center_y - offsety + Math.sin(rad) * radius,
            scale: 0.5,
            rotation: degrees
        }));
    }
    stage.update();
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
        return new Vector(v.x + this.x, v.y + this.y)
    }

    sub(v) {
        return new Vector(this.x - v.x, this.y - v.y)

    }

    mult(f) {
        return new Vector(f * this.x, f * this.y)
    }

    unit() {

        return this.mult(1 / this.length);
    }
}




