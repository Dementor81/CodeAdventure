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
const max_radius = 300;
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

    

    asteroids.forEach(a => drawAsteroid(a));

    player_container.removeAllChildren();
    player.shape = player_container.addChild((new createjs.Bitmap("player.png")).set({
        x: player.location.x,
        y: player.location.y,
        regX: imgPlayer.width / 2,
        regY: imgPlayer.height / 2,
        scale: 0.2,
    }))



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
    return asteroids.find(a => Vector.sub(asteroid.location, a.location).length < (asteroid.radius + a.radius))
}

function createAsteroid(outside = false) {
    const asteroid = {
        radius: Math.random2(max_radius - min_radius) + min_radius,
        shapeIndex: Math.round(Math.random2(shapes.length - 1)),
        rotation: Math.random() - 0.5
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

    asteroid.location.x += (Math.random() - 0.5) * 10;
    asteroid.location.y += (Math.random() - 0.5) * 10;

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
        p = calcCircle(degrees * (Math.PI / 180), r)//- (arr[index]) * (r));
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

    asteroids.forEach((asteroid, i) => {
        const prev = { x: asteroid.location.x, y: asteroid.location.y };
        let movement = Vector.sub(asteroid.location, asteroid.prev_location);
        asteroid.location = Vector.add(asteroid.location, movement);

        for (let index = i + 1; index < asteroids.length; index++) {
            const other_asteroid = asteroids[index];
            const distance = Vector.sub(asteroid.location, other_asteroid.location).length;
            if (distance <= (asteroid.radius + other_asteroid.radius)) {
                let pushback = { x: asteroid.location.x, y: asteroid.location.y }
                pushback = Vector.sub(pushback, other_asteroid.location);
                pushback = Vector.mult(pushback, 1 / distance);
                //pushback = Vector.mult(pushback, distance - (asteroid.radius + other_asteroid.radius));


                asteroid.location = Vector.add(asteroid.location, Vector.mult(pushback, (distance - asteroid.radius) / (distance / 2)));
                other_asteroid.location = Vector.sub(other_asteroid.location, Vector.mult(pushback, (distance - other_asteroid.radius) / (distance / 2)));
            }
        }



        asteroid.prev_location = prev;
    });


    astorid_container.children.forEach(c => {
        c.rotation += c.asteroid.rotation * 10 * delta;
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
            case KEYCODE_W:
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









