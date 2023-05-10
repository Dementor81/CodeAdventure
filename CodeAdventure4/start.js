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

var stage = null, astorid_container = null, player_container = null, overlay_container = null;
var time = 400;
var paused = true;
const max_radius = 200;
const min_radius = 50;
var steps = 30;
var playgroundSize = 1000;
var count_asteroids = 2//playgroundSize / 10;
const playground = { w: 0, h: 0 }
var asteroid_speed = 10;

var shapes = [];
var asteroids = [];

var player = {}

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



    stage.addChild(astorid_container = new createjs.Container());
    stage.addChild(player_container = new createjs.Container());
    stage.addChild(overlay_container = new createjs.Container());

    imgPlayer.src = "player.png";


    $(settings).append(addSlider("count_asteroids", 2, 1000));
    $(settings).append(addSlider("playgroundSize", 1000, 100000));

    startBtn.addEventListener("click", e => {
        paused = !paused
        $(fpsDisplay).text("paused");

        if (paused)
            createjs.Ticker.removeEventListener("tick", tick);
        else
            createjs.Ticker.addEventListener("tick", tick);
    });

    resetBtn.addEventListener("click", e => {
        reset();
    });

    document.addEventListener("keydown", e => {
        if (!keys.includes(e.keyCode))
            keys.push(e.keyCode);
    });

    document.addEventListener("keyup", e => {
        keys.remove(e.keyCode);
    });

    imgPlayer.addEventListener("load", e => {
        reset();
    });


});

function reset() {
    overlay_container.removeAllChildren();
    player = {
        location: { x: playgroundSize / 2, y: playgroundSize / 2 },
        movement: new Vector(),
        rotation: 0,
        toString: function () { return `location: ${Math.round(this.location.x)}/${Math.round(this.location.y)}<br> movement: ${Math.round(this.movement.x)}/${Math.round(this.movement.y)}<br> rotation: ${this.rotation}` }

    }

    stage.x = -(player.location.x - playground.w / 2);
    stage.y = -(player.location.y - playground.h / 2);

    createSpace();
}

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
        radius: 100,
        shapeIndex: 1,
        rotation_speed: 0,
        rotation: 0,
        location: { x: 200, y: 200 },
        motion: new Vector(0, 0)
    })

    asteroids.push({
        radius: 50,
        shapeIndex: 2,
        rotation_speed: 0,
        rotation: 0,
        location: { x: 330, y: 330},
        motion: new Vector(-1, -1),
    })

    asteroids.push({
        radius: 100,
        shapeIndex: 1,
        rotation_speed: 0,
        rotation: 0,
        location: { x: 0, y: 400 },
        motion: new Vector(1, 1),
    })

    asteroids.push({
        radius: 50,
        shapeIndex: 2,
        rotation_speed: 0,
        rotation: 0,
        location: { x: 230, y: 630},
        motion: new Vector(0, 0)
    }) */

/*     asteroids.push({
        radius: 50,
        shapeIndex: 1,
        rotation_speed: 0,
        rotation: 0,
        location: { x: 350, y: 350 },
        motion: new Vector(1, 1),
    })

    asteroids.push({
        radius: 500,
        shapeIndex: 2,
        rotation_speed: 0,
        rotation: 0,
        location: { x: 550, y: 900},
        motion: new Vector(0, 0)
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
        //arr.push(Math.random());
        arr.push(0.1);
    }

    let next_i;
    let smooth;
    for (let j = 0; j < 0; j++) {
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
    p1 = calcCircle(other_asteroid.rotation * (Math.PI / 180), other_asteroid.radius, other_arr[0]);
    p1.x += other_asteroid.location.x;
    p1.y += other_asteroid.location.y;

    for (let i = 0; i < steps; i++) {
        next_i = i == steps - 1 ? 0 : i + 1;

        p2 = calcCircle((other_asteroid.rotation + inc * next_i) * (Math.PI / 180), other_asteroid.radius, other_arr[next_i]);
        p2.x += other_asteroid.location.x;
        p2.y += other_asteroid.location.y;

        other_asteroid_borders.push({ start: p1, end: p2 })

        p1 = p2;
    }

    /* let shape = new createjs.Shape();
    overlay_container.addChild(shape);
    shape.graphics.setStrokeStyle(1).beginStroke("#ff0000");

    other_asteroid_borders.forEach(b => {
        shape.graphics.mt(b.start.x, b.start.y);
        shape.graphics.lt(b.end.x, b.end.y);
    }); */


    p1 = calcCircle(asteroid.rotation * (Math.PI / 180), asteroid.radius, - arr[0]);
    p1.x += asteroid.location.x;
    p1.y += asteroid.location.y;
    for (let i = 0; i < steps; i++) {
        next_i = i == steps - 1 ? 0 : i + 1;

        p2 = calcCircle((asteroid.rotation + inc * next_i) * (Math.PI / 180), asteroid.radius, arr[next_i]);
        p2.x += asteroid.location.x;
        p2.y += asteroid.location.y;
        border = { start: p1, end: p2 };

        /* shape = new createjs.Shape();
        overlay_container.addChild(shape);
        shape.graphics.setStrokeStyle(1).beginStroke("#00ff00");


        shape.graphics.mt(border.start.x, border.start.y);
        shape.graphics.lt(border.end.x, border.end.y); */


        if (other_asteroid_borders.some(otherBorder => {
            if (getIntersectionPoint(border, otherBorder) != null)
                return true;
            else return false;
        })) return true;

        p1 = p2;
    }

    //overlay_container.removeAllChildren();

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


    asteroid.motion = new Vector((Math.random() - 0.5) * (max_radius / asteroid.radius), (Math.random() - 0.5) * (max_radius / asteroid.radius));

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
        p = calcCircle(degrees * (Math.PI / 180), r, arr[index]);
        shape.graphics.lt(p.x, p.y);
        index++;
    }
    shape.graphics.cp();
    shape.cache(-r, -r, r * 2, r * 2);
}

function calcCircle(rad, radius, offset) {
    radius -= offset * (radius / 3);
    return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius, }
}

function calcCollision(m1, m2, v1, v2) {
    return ((m1 - m2) / (m1 + m2)) * v1 + ((2 * m2) / (m1 + m2)) * v2
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

        asteroid.rotation += (asteroid.rotation_speed * 2 * delta) % 360;

        if (asteroid.location.x.between(window.x1, window.x2) && asteroid.location.y.between(window.y1, window.y2)) {
            for (let index = i + 1; index < asteroids.length; index++) {

                const other_asteroid = asteroids[index];
                const distance_vector = Vector.sub(asteroid.location, other_asteroid.location);
                if (distance_vector.length <= (asteroid.radius + other_asteroid.radius) * 1) {

                    const relative = Vector.sub(asteroid.motion, other_asteroid.motion).unit();
                    const dot = Vector.dot(relative, distance_vector.unit());

                    if (dot < 0 && advancedCollision(asteroid, other_asteroid)) {
                        let pushback = Vector.sub(other_asteroid.location, asteroid.location).unit();

                        const ma = asteroid.radius,
                            mb = other_asteroid.radius,
                            vbf = calcCollision(ma, mb, asteroid.motion.length, other_asteroid.motion.length),
                            vaf = calcCollision(mb, ma, other_asteroid.motion.length, asteroid.motion.length)


                        const pushback_b = Vector.mult(pushback , vbf );
                        const pushback_a = Vector.mult(pushback , vaf );

                        


                        asteroid.motion = Vector.sub(asteroid.motion,pushback_b);

                        other_asteroid.motion = Vector.add(other_asteroid.motion,pushback_a); 

                        /* const result = calcCollisionGPT2(asteroid.radius,other_asteroid.radius,asteroid.motion,other_asteroid.motion);
                        asteroid.motion = result[0];
                        other_asteroid.motion = result[1];
                        console.log(result); */

                    }
                }
            }
        }

        asteroid.location = Vector.add(asteroid.location, asteroid.motion);


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

