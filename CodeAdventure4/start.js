'use strict';
var stage = null;
var imgSleeper = null;
var imgNails = null;
var startDeg = 0, endDeg = 45;
var radius = 400;
var steps = 10;

$(() => {


    $(window).resize(() => {
        $(myCanvas).attr("height", $(CanvasContainer).height() - 5).attr("width", $(CanvasContainer).width());
    });
    $(myCanvas).attr("height", $(CanvasContainer).height() - 5).attr("width", $(CanvasContainer).width());
    stage = new createjs.Stage(myCanvas);



    drawEverything();



    //DrawCircle(0, 45, w / 2, h / 2, 700, context);


    $(settings).append(addSlider("radius", 10, 1000, e => { drawEverything(); }));
    $(settings).append(addSlider("steps", 5, 1000, e => { drawEverything(); }));


});

function addSlider(text, min, max, onChange) {
    const id = "slider" + (Math.random() * 100).toFixed();
    return $("<div>").append([$("<label>", { for: id }).text(text),
    $("<input>", { id: id, type: "range", min: min, max: max, value: globalThis[text] }).on("input", e => {
        globalThis[text] = parseInt(e.target.value);
        if (onChange) onChange(e);
    })]);
}

function drawEverything() {
    stage.removeAllChildren();
    const w = myCanvas.width;
    const h = myCanvas.height;

    DrawCircle(w / 2, h / 2, radius);

    stage.update();
}

function DrawCircle(center_x, center_y, radius) {
    let p = calcCircle(0, radius);
    const shape = new createjs.Shape();
    stage.addChild(shape);
    shape.x = center_x;
    shape.y = center_y;

    shape.graphics.setStrokeStyle(1).beginStroke("#000000")//.mt(p.x, p.y);

    const inc = 360 / steps;

    const arr = [];
    for (let index = 0; index < steps; index++) {
        arr.push(Math.random());
    }

    let next_i;
    let smooth;
    for (let j = 0; j < 5; j++) {
        for (let i = 0; i < steps ; i++) {
            next_i = i == steps - 1 ? 0 : i + 1;
            smooth = (arr[i] - arr[next_i]) / 2
            arr[i] -= smooth;
            arr[next_i] += smooth;
        }
    }

    

    let index = 0;
    for (let degrees = 0; degrees < 360; degrees += inc) {

        p = calcCircle(degrees * (Math.PI / 180), radius + (arr[index]-0.5) * (radius));
        shape.graphics.lt(p.x, p.y);
        index++;
    }



    shape.graphics.cp();
}

function calcCircle(rad, radius) {
    return {
        x: Math.cos(rad) * radius,
        y: Math.sin(rad) * radius,
    }
}









