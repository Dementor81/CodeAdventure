'use strict';
var stage = null;
var time = 400;
var radius = 10;
var points = [];
var sticks = [];
var mouseMoved = {};
var paused = true;
var gravity = 9.81;
var iterations = 50;

$(() => {


    $(window).resize(() => {
        $(myCanvas).attr("height", $(CanvasContainer).height() - 5).attr("width", $(CanvasContainer).width());
    });
    $(myCanvas).attr("height", $(CanvasContainer).height() - 5).attr("width", $(CanvasContainer).width());
    stage = new createjs.Stage(myCanvas);



    const w = myCanvas.width;
    const h = myCanvas.height;

    const img = new Image();
    img.onload = () => {
        DrawCircleII(0, 45, w / 2, h / 2, 300, 5, img);
        const shape = new createjs.Shape();
        shape.graphics.setStrokeStyle(5).beginStroke("#000").arc(w / 2 - 400, h / 2, 400, 0, (Math.PI / 180) * 45);
        stage.addChild(shape);
        stage.update();



    };
    img.src = "plenk.png";





    //DrawCircle(0, 45, w / 2, h / 2, 700, context);



});

function DrawCircleII(start_deg, end_deg, center_x, center_y, radius, num, img) {
    let rad;
    const steps = Math.abs(start_deg - end_deg) / num

    for (let degrees = start_deg; degrees < end_deg; degrees += steps) {
        rad = degrees * (Math.PI / 180);

        stage.addChild((new createjs.Bitmap(img)).set({
            x: center_x - radius + Math.cos(rad) * radius,
            y: center_y + Math.sin(rad) * radius,
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




