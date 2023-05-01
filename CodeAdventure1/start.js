'use strict';
var stage = null;
var line_container = null;
var dots = [];
var dot_count = 100;
var time = 1000;
var radius = 2;
var line_threshold = 100;

$(() => {


    $(window).resize(() => {
        $(myCanvas).attr("height", $(CanvasContainer).height() - 5).attr("width", $(CanvasContainer).width());
    });
    $(myCanvas).attr("height", $(CanvasContainer).height() - 5).attr("width", $(CanvasContainer).width());
    stage = new createjs.Stage(myCanvas);
    line_container = new createjs.Container();
    stage.addChild(line_container);
    createjs.Ticker.framerate = 60;
    const w = stage.canvas.width;
    const h = stage.canvas.height;
    for (let index = 0; index < dot_count; index++) {
        const shape = new createjs.Shape();
        stage.addChild(shape);
        shape.graphics.beginFill("#000").drawCircle(0, 0, radius);
        shape.cache(-radius, -radius, radius * 2, radius * 2);

        const dot = {
            pos: { x: Math.random() * w, y: Math.random() * h },
            movement: { x: (Math.random() * 2 - 1) * 10, y: (Math.random() * 2 - 1) * 10 },
            shape: shape
        }


        dots.push(dot);

    }
    $(timeRange)[0].value = time;
    $(timeRange).on("input", (e) => {
        time = e.target.value;
    });

    $(lineRange)[0].value = line_threshold;
    $(lineRange).on("input", (e) => {
        line_threshold = e.target.value;
    });

    createjs.Ticker.addEventListener("tick", tick);
});


function tick(event) {
    var delta = event.delta / time;
    const w = stage.canvas.width;
    const h = stage.canvas.height;
    const double_r = radius * 2

    line_container.removeAllChildren();

    for (let index = 0; index < dot_count; index++) {
        const dot = dots[index];
       

        dot.shape.x = dot.pos.x;
        dot.shape.y = dot.pos.y;

        dot.pos.x = Math.min(w, Math.max(0, dot.pos.x + dot.movement.x * delta));
        dot.pos.y = Math.min(h, Math.max(0, dot.pos.y + dot.movement.y * delta));

        if (dot.pos.x.is(0, w)) dot.movement.x = dot.movement.x * -1;
        if (dot.pos.y.is(0, h)) dot.movement.y = dot.movement.y * -1;

        for (let j = index + 1; j < dot_count; j++) {
            const near_dot = dots[j];
            const d = distance(dot.pos, near_dot.pos);
            if (d <= double_r) {
                const h = dot.movement;
                dot.movement = near_dot.movement;
                near_dot.movement = h;

                /* dot.movement.x = dot.movement.x * -1;
                dot.movement.y = dot.movement.y * -1;
                near_dot.movement.x = near_dot.movement.x * -1;
                near_dot.movement.y = near_dot.movement.y * -1; */
            } else if (d < line_threshold) {
                const shape = new createjs.Shape();
                line_container.addChild(shape);
                shape.graphics.setStrokeStyle(1).beginStroke("#000000").mt(dot.pos.x,dot.pos.y).lt(near_dot.pos.x,near_dot.pos.y)
                
            }
        }

    }
    $(fpsDisplay).text(Math.round(createjs.Ticker.getMeasuredFPS()) + " fps");
    stage.update(event);
}

