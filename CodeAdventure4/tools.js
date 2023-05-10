'use strict';
Number.prototype.between = function (a, b) {
    var min = Math.min.apply(Math, [a, b]),
        max = Math.max.apply(Math, [a, b]);
    return this >= min && this <= max;
};

Number.prototype.outoff = function (a, b) {
    var min = Math.min.apply(Math, [a, b]),
        max = Math.max.apply(Math, [a, b]);
    return this < min || this > max;
};

Number.prototype.is = function (a) {
    return Array.from(arguments).includes(this)
};

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

Math.random2 = function (range) {
    return Math.round(Math.random() * range);
}

Array.prototype.remove = function (item) {
    const index = this.indexOf(item);
    if (index > -1) {
        this.splice(index, 1);
    }
}

function rad(deg) {
    return deg * (Math.PI / 180);
}

function getIntersectionPoint(line1, line2) {
    const denominator = ((line2.end.y - line2.start.y) * (line1.end.x - line1.start.x)) -
        ((line2.end.x - line2.start.x) * (line1.end.y - line1.start.y));

    // If the denominator is 0, the lines are parallel and don't intersect
    if (denominator === 0) {
        return null;
    }

    const ua = (((line2.end.x - line2.start.x) * (line1.start.y - line2.start.y)) -
        ((line2.end.y - line2.start.y) * (line1.start.x - line2.start.x))) / denominator;
    const ub = (((line1.end.x - line1.start.x) * (line1.start.y - line2.start.y)) -
        ((line1.end.y - line1.start.y) * (line1.start.x - line2.start.x))) / denominator;

    // If ua or ub is less than 0 or greater than 1, the intersection point is outside of the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return null;
    }

    // Calculate the intersection point
    const intersectionX = line1.start.x + ua * (line1.end.x - line1.start.x);
    const intersectionY = line1.start.y + ua * (line1.end.y - line1.start.y);

    return { x: intersectionX, y: intersectionY };
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

    static add(v, v2) {
        return new Vector(v.x + v2.x, v.y + v2.y);
    }

    static sub(v, v2) {
        return new Vector(v.x - v2.x, v.y - v2.y);
    }

    static mult(v, f) {
        return new Vector(v.x * f, v.y * f);
    }

    static rotate(v, deg) {
        const r = rad(deg);
        return new Vector(Math.cos(r) * v.x - Math.sin(r) * v.y, Math.sin(r) * v.x + Math.cos(r) * v.y);
    }

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    unit() {
        return Vector.mult(this, 1 / this.length);
    }
}

function calcCollisionGPT1(m1, m2, v1i, v2i) {
    // Define the objects' initial velocities and masses

    // Calculate the initial momentum of each object
    let p1i = { x: m1 * v1i.x, y: m1 * v1i.y }; // momentum of object 1 in x and y directions
    let p2i = { x: m2 * v2i.x, y: m2 * v2i.y }; // momentum of object 2 in x and y directions

    // Calculate the total momentum of the system before the collision
    let ptoti = { x: p1i.x + p2i.x, y: p1i.y + p2i.y }; // total momentum of the system in x and y directions

    // Apply the conservation of momentum principle to find the total momentum of the system after the collision
    let ptotf = { x: ptoti.x, y: ptoti.y }; // total momentum of the system after the collision in x and y directions

    // Calculate the final velocities of both objects
    let v1f = { x: (ptotf.x - p2i.x) / m1, y: (ptotf.y - p2i.y) / m1 }; // final velocity of object 1 in x and y directions
    let v2f = { x: (ptotf.x - p1i.x) / m2, y: (ptotf.y - p1i.y) / m2 }; // final velocity of object 2 in x and y directions

    // Check if kinetic energy is conserved
    let kei = 0.5 * m1 * (v1i.x ** 2 + v1i.y ** 2) + 0.5 * m2 * (v2i.x ** 2 + v2i.y ** 2); // initial kinetic energy of the system
    let kef = 0.5 * m1 * (v1f.x ** 2 + v1f.y ** 2) + 0.5 * m2 * (v2f.x ** 2 + v2f.y ** 2); // final kinetic energy of the system

    if (kei === kef) {
        console.log("Kinetic energy is conserved");
    } else {
        console.log("Kinetic energy is not conserved");
    }

    return [v1f, v2f];
}

function calcCollisionGPT2(m1, m2, v1i, v2i) {
    // Define the initial parameters for the first object

    let v1x = v1i.x; // initial velocity of object 1 in the x direction
    let v1y = v1i.y; // initial velocity of object 1 in the y direction
    let px1 = m1 * v1x; // initial momentum of object 1 in the x direction
    let py1 = m1 * v1y; // initial momentum of object 1 in the y direction

    // Define the initial parameters for the second object

    let v2x = v2i.x; // initial velocity of object 2 in the x direction
    let v2y = v2i.y; // initial velocity of object 2 in the y direction
    let px2 = m2 * v2x; // initial momentum of object 2 in the x direction
    let py2 = m2 * v2y; // initial momentum of object 2 in the y direction

    // Calculate the total momentum and kinetic energy before the collision
    let pxtotal = px1 + px2; // total momentum in the x direction
    let pytotal = py1 + py2; // total momentum in the y direction
    let Ktotal = 0.5 * m1 * (v1x ** 2 + v1y ** 2) + 0.5 * m2 * (v2x ** 2 + v2y ** 2); // total kinetic energy

    // Calculate the final velocities after the collision
    let v1xf = (pxtotal - m2 * (v1x - v2x)) / (m1 + m2); // final velocity of object 1 in the x direction
    let v1yf = (pytotal - m2 * (v1y - v2y)) / (m1 + m2); // final velocity of object 1 in the y direction
    let v2xf = (pxtotal - m1 * (v2x - v1x)) / (m1 + m2); // final velocity of object 2 in the x direction
    let v2yf = (pytotal - m1 * (v2y - v1y)) / (m1 + m2); // final velocity of object 2 in the y direction

    // Calculate the total kinetic energy after the collision
    let Ktotal_f = 0.5 * m1 * (v1xf ** 2 + v1yf ** 2) + 0.5 * m2 * (v2xf ** 2 + v2yf ** 2);

    // Check if momentum and kinetic energy are conserved
    if (Math.abs(pxtotal - (m1 * v1xf + m2 * v2xf)) < 0.0001 && Math.abs(pytotal - (m1 * v1yf + m2 * v2yf)) < 0.0001 && Math.abs(Ktotal - Ktotal_f) < 0.0001) {
        console.log("Momentum and kinetic energy are conserved.");
    } else {
        console.log("Momentum and kinetic energy are not conserved.");
    }

    // Output the final velocities
    console.log("Final velocity of object 1: (" + v1xf + ", " + v1yf + ")");
    console.log("Final velocity of object 2: (" + v2xf + ", " + v2yf + ")");


    return [{ x: v1xf, y: v1yf }, { x: v2xf, y: v2yf }];
}