'use strict';
var stage = null;
var time = 400;
var paused = true;
const max_radius = 300;
const min_radius = 50;
var steps = 80;
const playgroundSize = 10000;

var count_asteroids = playgroundSize / 30;
const playground = { w: 0, h: 0 }
var asteroid_speed = 30;

var shapes = [];
var asteroids = [];

$(() => {

    const resize = () => {
        playground.w = $(CanvasContainer).width();
        playground.h = $(CanvasContainer).height();
        $(myCanvas).attr("height", playground.h - 5).attr("width", playground.w);
    }
    $(window).resize(resize);
    resize();
    stage = new createjs.Stage(myCanvas);


    createSpace();

    $(settings).append(addSlider("count_asteroids", 10, 1000, e => { createSpace(); }));
    $(settings).append(addSlider("asteroid_speed", 10, 1000));

    startBtn.addEventListener("click", e => {
        paused = !paused
        $(fpsDisplay).text("paused");

        if (paused)
            createjs.Ticker.removeEventListener("tick", tick);
        else
            createjs.Ticker.addEventListener("tick", tick);
    });


});

function addSlider(text, min, max, onChange) {
    const id = "slider" + (Math.random() * 100).toFixed();
    return $("<div>").append([$("<label>", { for: id }).text(text),
    $("<input>", { id: id, type: "range", min: min, max: max, value: globalThis[text] }).on("input", e => {
        globalThis[text] = parseInt(e.target.value);
        e.target.setAttribute("title", e.target.value)

        if (onChange) onChange(e);
    }).attr("title", globalThis[text])]);
}

function createSpace() {
    stage.removeAllChildren();
    shapes = [];
    for (let index = 0; index < 100; index++) {
        shapes.push(createAsteroidShape());
    }

    asteroids = [];
    let a = null;
    for (let index = 0; index < count_asteroids; index++) {
        a = createAsteroid()
        if (a) asteroids.push(a);
    }

    asteroids.forEach(a => drawAsteroid(a));
    stage.update();

}

function createAsteroidShape() {
    const arr = [];

    for (let index = 0; index < steps; index++) {
        arr.push(Math.random());
    }

    let next_i;
    let smooth;
    for (let j = 0; j < 5; j++) {
        for (let i = 0; i < steps; i++) {
            next_i = i == steps - 1 ? 0 : i + 1;
            smooth = (arr[i] - arr[next_i]) / 2
            arr[i] -= smooth;
            arr[next_i] += smooth;
        }
    }
    return arr;
}

function simpleCollision(asteroid) {
    return asteroids.find(a => Vector.sub(asteroid.location, a.location).length < (asteroid.radius + a.radius) * 0.9)
}

function createAsteroid(outside = false) {
    const asteroid = {
        radius: Math.random2(max_radius - min_radius) + min_radius,
        shapeIndex: Math.round(Math.random2(shapes.length - 1)),
        rotation: Math.random() - 0.5,
        movement: {
            x: Math.random() - 0.5,
            y: Math.random() - 0.5
        }
    }
    let trys = 0;
    do {
        asteroid.location = {
            x: Math.random2(playgroundSize),
            y: Math.random2(playgroundSize)
        }
        trys++;
    } while (simpleCollision(asteroid) != null && trys < 2000 && (!outside || asteroid.location.x.between(stage.x, stage.x + playground.w) && asteroid.location.y.between(stage.y, stage.y + playground.h)))
    
    if (trys < 2000)
        return asteroid;
    else    
    {
        console.log("no free space found " + asteroids.length);
        return null
    }
}

function drawAsteroid(asteroid) {
    let p;
    const shape = new createjs.Shape();
    shape.asteroid = asteroid;
    stage.addChild(shape);
    shape.x = asteroid.location.x;
    shape.y = asteroid.location.y;
    shape.rotation = asteroid.rotation;

    shape.graphics.setStrokeStyle(1).beginStroke("#000000");

    const inc = 360 / steps;

    const arr = shapes[asteroid.shapeIndex];
    const r = asteroid.radius;
    let index = 0;
    for (let degrees = 0; degrees < 360; degrees += inc) {
        p = calcCircle(degrees * (Math.PI / 180), r - (arr[index]) * (r));
        shape.graphics.lt(p.x, p.y);
        index++;
    }
    shape.graphics.cp();
    shape.cache(-r, -r, r * 2, r * 2);
}

function calcCircle(rad, radius) {
    return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius, }
}

function tick(event) {
    var delta = event.delta / time;

    stage.children.forEach(c => {
        c.rotation += c.asteroid.rotation * 10 * delta;
        c.x += c.asteroid.movement.x * asteroid_speed * delta;
        c.y += c.asteroid.movement.y * asteroid_speed * delta;
    });

    stage.children.filter(c => c.x.outoff(0, playgroundSize) || c.y.outoff(0, playgroundSize)).forEach(c => {
        stage.removeChild(c);
        asteroids.remove(c.asteroid);
        let a = createAsteroid(true);
        asteroids.push(a);
        drawAsteroid(a);
    })

    $(fpsDisplay).text(Math.round(createjs.Ticker.getMeasuredFPS()) + " fps");
    stage.update(event);
}









