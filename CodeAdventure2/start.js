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

    createjs.Ticker.framerate = 60;
    const w = stage.canvas.width;
    const h = stage.canvas.height;




    stage.on("stagemouseup", function (evt) {
        stage.removeEventListener("stagemousemove", handleMouseMove);
        if (stage.hitTest(stage.mouseX, stage.mouseY) || mouseMoved.moved || evt.nativeEvent.button != 0) return;
        mouseMoved.moved = false;
        const p = new Point(new Vector(stage.mouseX, stage.mouseY));
        points.push(p);

        const shape = new createjs.Shape();
        shape.graphics.beginFill("#000").drawCircle(0, 0, radius);
        shape.cache(-radius, -radius, radius * 2, radius * 2);
        shape.point = p;
        shape.x = p.position.x;
        shape.y = p.position.y;
        shape.on("click", e => {
            e.stopImmediatePropagation();
            e.preventDefault();
            const p = e.target.point;
            if (p) {
                p.locked = !p.locked;
                shape.graphics.beginFill(p.locked ? "#ff0000" : "#000").drawCircle(0, 0, radius);
                shape.cache(-radius, -radius, radius * 2, radius * 2);
                stage.update();
            }
        })

        shape.on("mousedown", e => {
            e.stopImmediatePropagation();
            e.preventDefault();
            const p = e.target.point;
            if (p) {
                mouseMoved.lastPoint = p;
                stage.addEventListener("stagemousemove", handleMouseMove);
                stage.on("stagemouseup", e => {
                    if (mouseMoved.moved == true) {
                        mouseMoved.moved = false;
                    }
                    stage.off("stagemousemove", handleMouseMove);
                }, null, true);
            }
        })

        stage.addChild(shape);
        stage.update();
    })

    startBtn.addEventListener("click", e => {
        paused = !paused
        if (paused)
            createjs.Ticker.removeEventListener("tick", tick);
        else
            createjs.Ticker.addEventListener("tick", tick);
    });

    $(settings).append(addSlider("time", 10, 500, time, e => { time = e.target.value; }))
    $(settings).append(addSlider("iterations", 1, 100, iterations, e => { iterations = e.target.value; }))



});

function handleMouseMove(e) {
    if (e.nativeEvent.buttons == 0) stage.off("stagemousemove", handleMouseMove);
    mouseMoved.moved = true;

    const hitTest = stage.getObjectUnderPoint(stage.mouseX, stage.mouseY);
    if (hitTest && hitTest.point && hitTest.point != mouseMoved.lastPoint) {
        const shape = new createjs.Shape();
        shape.stick = new Stick(mouseMoved.lastPoint, hitTest.point);
        shape.graphics.setStrokeStyle(1).beginStroke("#000").mt(mouseMoved.lastPoint.position.x, mouseMoved.lastPoint.position.y).lt(hitTest.point.position.x, hitTest.point.position.y);
        stage.addChild(shape);
        sticks.push(shape.stick);
        mouseMoved.lastPoint = hitTest.point;
        stage.update();
    }
}

function addSlider(text, min, max, value, onChange) {
    const id = "slider" + (Math.random() * 100).toFixed();
    return $("<div>").append([$("<label>", { for: id }).text(text),
    $("<input>", { id: id, type: "range", min: min, max: max, value: value }).on("input", onChange)]);
}


function tick(event) {
    var delta = event.delta / time;


    if (!paused) simulate(delta);


    const double_r = radius * 2

    stage.children.forEach(element => {
        if (element.point) {
            element.x = element.point.position.x;
            element.y = element.point.position.y;
        }
        if (element.stick) {
            element.graphics.c().setStrokeStyle(1).beginStroke("#000").mt(element.stick.pointA.position.x, element.stick.pointA.position.y).lt(element.stick.pointB.position.x, element.stick.pointB.position.y);

        }
    });


    $(fpsDisplay).text(Math.round(createjs.Ticker.getMeasuredFPS()) + " fps");
    stage.update(event);
}

function simulate(delta) {
    const w = stage.canvas.width-radius;
    const h = stage.canvas.height;
    const grav = gravity * delta * delta;
    points.forEach(p => {
        if (!p.locked) {
            const before = p.position;
            const movement = p.position.sub(p.prevPosition);


            if (p.position.y <= h - radius) {
                p.position = p.position.add(movement);
            } else {
                p.position = p.position.add(movement.mult(-0.9));
                p.position.y = Math.min(h - radius, p.position.y);
            }

            if (p.position.x.outoff(radius, w)) {
                p.position.x = 10//p.position.x + movement.mult(-0.9).x;
            }

            p.position = p.position.add((new Vector(0, 1)).mult(grav));

            //p.position.y = Math.min(h - radius, Math.max(0, p.position.y));
           


            p.prevPosition = before;

        }
    })

    for (let index = 0; index < iterations; index++) {
        sticks.forEach(stick => {
            const center = stick.pointA.position.add(stick.pointB.position).mult(0.5);
            const direction = stick.pointA.position.sub(stick.pointB.position).unit();
            if (!stick.pointA.locked)
                stick.pointA.position = center.add(direction.mult(stick.length / 2));
            if (!stick.pointB.locked)
                stick.pointB.position = center.sub(direction.mult(stick.length / 2));
        })
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

class Point {
    position = new Vector()
    prevPosition = new Vector();
    inertia = new Vector(0, 0);
    locked = false;

    constructor(p) {
        this.prevPosition = this.position = p;
    }

}

class Stick {
    pointA = new Point()
    pointB = new Point()
    length = 0;

    constructor(a, b) {

        this.pointA = a;
        this.pointB = b;
        this.length = Math.sqrt(Math.pow(this.pointA.position.x - this.pointB.position.x, 2) + Math.pow(this.pointA.position.y - this.pointB.position.y, 2));
    }
}

