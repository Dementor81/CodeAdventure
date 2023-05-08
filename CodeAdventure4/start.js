'use strict';
const KEYCODE_ENTER = 13;		//useful keycode
const KEYCODE_SPACE = 32;		//useful keycode
const KEYCODE_UP = 38;		//useful keycode
const KEYCODE_LEFT = 37;		//useful keycode
const KEYCODE_RIGHT = 39;		//useful keycode
const KEYCODE_DOWN = 40;		//useful keycode
const KEYCODE_W = 87;			//useful keycode
const KEYCODE_A = 65;			//useful keycode
const KEYCODE_D = 68;
const KEYCODE_S = 83;

var stage = null, astorid_container = null, player_container = null;
var time = 400;
var paused = true;
const max_radius = 200;
const min_radius = 50;
var steps = 80;
const playgroundSize = 10000;

var count_asteroids = playgroundSize / 10;
const playground = { w: 0, h: 0 }
var asteroid_speed = 10;

var shapes = [];
var asteroids = [];

const player = {
    location: { x: playgroundSize / 2, y: playgroundSize / 2 },
    movement: new Vector(),
    rotation: 0,
    toString: function () { return `location: ${Math.round(this.location.x)}/${Math.round(this.location.y)}<br> movement: ${Math.round(this.movement.x)}/${Math.round(this.movement.y)}<br> rotation: ${this.rotation}` }

}

const keys = [];

const imgPlayer = new Image();

$(() => {

    const resize = () => {
        playground.w = $(CanvasContainer).width();
        playground.h = $(CanvasContainer).height();
        $(myCanvas).attr("height", playground.h - 5).attr("width", playground.w);
    }
    $(window).resize(resize);
    resize();
    stage = new createjs.Stage(myCanvas);
    stage.x = -(player.location.x - playground.w / 2);
    stage.y = -(player.location.y - playground.h / 2);



    stage.addChild(astorid_container = new createjs.Container());
    stage.addChild(player_container = new createjs.Container());

    imgPlayer.src = "player.png";

    imgPlayer.addEventListener("load", e => {
        createSpace();
    });


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

    document.addEventListener("keydown", e => {
        if (!keys.includes(e.keyCode))
            keys.push(e.keyCode);
    });

    document.addEventListener("keyup", e => {
        keys.remove(e.keyCode);
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
    astorid_container.removeAllChildren();
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

    /* asteroids.push({
        radius: 200,
        shapeIndex: 1,
        rotation: 0,
        location: { x: 300, y: 200 },
        prev_location: { x: 300, y: 200 },
    })

    asteroids.push({
        radius: 100,
        shapeIndex: 1,
        rotation: 0,
        location: { x: 600, y: 200 },
        prev_location: { x: 605, y: 200 },
    }) */


    asteroids.forEach(a => drawAsteroid(a));

    player_container.removeAllChildren();
    player.shape = player_container.addChild((new createjs.Bitmap("player.png")).set({
        x: player.location.x,
        y: player.location.y,
        regX: imgPlayer.width / 2,
        regY: imgPlayer.height / 2,
        scale: 0.15,
    }))



    stage.update();

}

function createAsteroidShape() {
    const arr = [];

    for (let index = 0; index < steps; index++) {
        arr.push(Math.random());
        // arr.push(0.1);
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
    return asteroids.find(a => Vector.sub(asteroid.location, a.location).length < (asteroid.radius + a.radius))
}

function advancedCollision(asteroid, other_asteroid) {
    const other_asteroid_borders = []
    const other_arr = shapes[other_asteroid.shapeIndex];
    const arr = shapes[asteroid.shapeIndex];

    let next_i, p1, p2, border;
    const inc = 360 / steps;
    p1 = calcCircle(other_asteroid.rotation, other_asteroid.radius - (other_arr[0]) * (other_asteroid.radius));
    p1.x += other_asteroid.location.x;
    p1.y += other_asteroid.location.y;

    for (let i = 0; i < steps; i++) {
        next_i = i == steps - 1 ? 0 : i + 1;

        p2 = calcCircle((other_asteroid.rotation + inc * next_i) * (Math.PI / 180), other_asteroid.radius - (other_arr[next_i]) * (other_asteroid.radius));
        p2.x += other_asteroid.location.x;
        p2.y += other_asteroid.location.y;

        other_asteroid_borders.push({ start: p1, end: p2 })

        p1 = p2;
    }

    p1 = calcCircle(asteroid.rotation, asteroid.radius - (arr[0]) * (asteroid.radius));
    p1.x += asteroid.location.x;
    p1.y += asteroid.location.y;
    for (let i = 0; i < steps; i++) {
        next_i = i == steps - 1 ? 0 : i + 1;

        p2 = calcCircle((asteroid.rotation + inc * next_i) * (Math.PI / 180), asteroid.radius - (arr[next_i]) * (asteroid.radius));
        p2.x += asteroid.location.x;
        p2.y += asteroid.location.y;
        border = { start: p1, end: p2 };

        if (other_asteroid_borders.some(otherBorder => {
            if (getIntersectionPoint(border, otherBorder) != null)
                return true;
            else return false;
        })) return true;

        p1 = p2;
    }

}

function createAsteroid(outside = false) {
    const asteroid = {
        radius: Math.random2(max_radius - min_radius) + min_radius,
        shapeIndex: Math.round(Math.random2(shapes.length - 1)),
        rotation_speed: (Math.random() - 0.5),
        rotation: 0
    }
    let trys = 0;
    do {
        asteroid.location = {
            x: Math.random2(playgroundSize),
            y: Math.random2(playgroundSize)
        }
        trys++;
    } while ((simpleCollision(asteroid) != null || (outside && asteroid.location.x.between(-stage.x, -stage.x + playground.w) && asteroid.location.y.between(-stage.y, -stage.y + playground.h))) && trys < 2000)

    asteroid.prev_location = { x: asteroid.location.x, y: asteroid.location.y };

    asteroid.location.x += (Math.random() - 0.5) * (max_radius / asteroid.radius);
    asteroid.location.y += (Math.random() - 0.5) * (max_radius / asteroid.radius);

    return trys < 2000 ? asteroid : null;

}

function drawAsteroid(asteroid) {
    let p;
    const shape = new createjs.Shape();
    shape.asteroid = asteroid;
    astorid_container.addChild(shape);
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
    //remove asteroids outside playground
    astorid_container.children.filter(c => c.x.outoff(0, playgroundSize) || c.y.outoff(0, playgroundSize)).forEach(c => {
        astorid_container.removeChild(c);
        asteroids.remove(c.asteroid);

    })
    //add new asteroids
    if (asteroids.length < count_asteroids) {
        let a = createAsteroid(true);
        if (a) {
            asteroids.push(a);
            drawAsteroid(a);
        }
    }

    const window = {
        x1: -stage.x - 500,
        y1: -stage.y - 500
    };
    window.x2 = window.x1 + playground.w + 1000;
    window.y2 = window.y1 + playground.h + 1000;



    asteroids.forEach((asteroid, i) => {
        const prev = { x: asteroid.location.x, y: asteroid.location.y };
        let movement = Vector.sub(asteroid.location, asteroid.prev_location);
        asteroid.location = Vector.add(asteroid.location, movement);
        asteroid.rotation += (asteroid.rotation_speed * delta) % 360;

        if (asteroid.location.x.between(window.x1, window.x2) && asteroid.location.y.between(window.y1, window.y2))
            for (let index = i + 1; index < asteroids.length; index++) {

                const other_asteroid = asteroids[index];
                const distance = Vector.sub(asteroid.location, other_asteroid.location).length;
                if (distance <= (asteroid.radius + other_asteroid.radius) * 0.9 && advancedCollision(asteroid, other_asteroid)) {
                    let pushback = { x: asteroid.location.x, y: asteroid.location.y }
                    pushback = Vector.sub(pushback, other_asteroid.location);
                    pushback = Vector.mult(pushback, 1 / distance);
                    pushback = Vector.mult(pushback, Math.min(20, (movement.length + Vector.sub(other_asteroid.location, other_asteroid.prev_location).length) / 2));
                    //pushback = Vector.mult(pushback, distance - (asteroid.radius + other_asteroid.radius));


                    /* asteroid.location = Vector.add(asteroid.locationVector.mult(pushback, Math.min(1, other_asteroid.radius / asteroid.radius)));
                    other_asteroid.location = Vector.sub(other_asteroid.location, Vector.mult(pushback, Math.min(1, asteroid.radius / other_asteroid.radius))); */

                    asteroid.location = Vector.add(asteroid.location, pushback);
                    other_asteroid.location = Vector.sub(other_asteroid.location, pushback);
                }
            }



        asteroid.prev_location = prev;
    });


    astorid_container.children.forEach(c => {
        c.rotation = c.asteroid.rotation;
        c.x = c.asteroid.location.x;
        c.y = c.asteroid.location.y;
    });


    keys.forEach(key => {
        switch (key) {
            case KEYCODE_SPACE:

                break;
            case KEYCODE_A:
            case KEYCODE_LEFT:
                player.rotation -= 3
                break;
            case KEYCODE_D:
            case KEYCODE_RIGHT:
                player.rotation += 3
                break;
            case KEYCODE_W:
            case KEYCODE_UP:
                player.movement = Vector.sub(player.movement, Vector.rotate(new Vector(0, 1), player.rotation))
                break;
            case KEYCODE_S:
            case KEYCODE_DOWN:
                player.movement = Vector.add(player.movement, Vector.rotate(new Vector(0, 1), player.rotation))
                break;
        }
    })

    player.shape.x = player.location.x += player.movement.x * 4 * delta * delta;
    player.shape.y = player.location.y += player.movement.y * 4 * delta * delta;
    player.shape.rotation = player.rotation;

    stage.x = -(player.shape.x - playground.w / 2);
    stage.y = -(player.shape.y - playground.h / 2);
    $(stats).empty()
    $(stats).append("player:<br>" + player.toString());
    $(stats).append(`<br>asteroids: ${asteroids.length}/${Math.round(count_asteroids)}`);

    $(fpsDisplay).text(Math.round(createjs.Ticker.getMeasuredFPS()) + " fps");
    stage.update(event);
}









