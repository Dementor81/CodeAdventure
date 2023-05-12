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

    static mirror(d, n) {

        return Vector.sub(d, Vector.mult(n, 2 * Vector.dot(d, n)));
    }

    unit() {
        return this.length == 0 ? new Vector(0, 0) : Vector.mult(this, 1 / this.length);
    }
}

function movingCircleCollision(c1, c2) {



    let combinedRadii, overlap, xSide, ySide,
        //`s` refers to the distance vector between the circles
        s = {},
        p1A = {},
        p1B = {},
        p2A = {},
        p2B = {};


    s.vx = c2.location.x - c1.location.x;
    s.vy = c2.location.y - c1.location.y;


    //Find the distance between the circles by calculating
    //the vector's length (how long the vector is)
    s.length = Math.sqrt(s.vx * s.vx + s.vy * s.vy);

    //Add together the circles' combined half-widths
    combinedRadii = c1.radius + c2.radius;



    //Find the amount of overlap between the circles
    overlap = combinedRadii - s.length;

    //Add some "quantum padding" to the overlap
    overlap += 0.3;

    //Normalize the vector.
    //These numbers tell us the direction of the collision
    s.dx = s.vx / s.length;
    s.dy = s.vy / s.length;

    //Find the collision vector.
    //Divide it in half to share between the circles, and make it absolute
    s.vxHalf = Math.abs(s.dx * overlap / 2);
    s.vyHalf = Math.abs(s.dy * overlap / 2);

    //Find the side that the collision is occurring on
    (c1.location.x > c2.location.x) ? xSide = 1 : xSide = -1;
    (c1.location.y > c2.location.y) ? ySide = 1 : ySide = -1;

    //Move c1 out of the collision by multiplying
    //the overlap with the normalized vector and adding it to
    //the circles' positions
  /*   c1.location.x = c1.location.x + (s.vxHalf * xSide);
    c1.location.y = c1.location.y + (s.vyHalf * ySide);

    //Move c2 out of the collision
    c2.location.x = c2.location.x + (s.vxHalf * -xSide);
    c2.location.y = c2.location.y + (s.vyHalf * -ySide); */

    //1. Calculate the collision surface's properties

    //Find the surface vector's left normal
    s.lx = s.vy;
    s.ly = -s.vx;

    //2. Bounce c1 off the surface (s)

    //Find the dot product between c1 and the surface
    let dp1 = c1.motion.x * s.dx + c1.motion.y * s.dy;

    //Project c1's velocity onto the collision surface
    p1A.x = dp1 * s.dx;
    p1A.y = dp1 * s.dy;

    //Find the dot product of c1 and the surface's left normal (s.lx and s.ly)
    let dp2 = c1.motion.x * (s.lx / s.length) + c1.motion.y * (s.ly / s.length);

    //Project the c1's velocity onto the surface's left normal
    p1B.x = dp2 * (s.lx / s.length);
    p1B.y = dp2 * (s.ly / s.length);

    //3. Bounce c2 off the surface (s)

    //Find the dot product between c2 and the surface
    let dp3 = c2.motion.x * s.dx + c2.motion.y * s.dy;

    //Project c2's velocity onto the collision surface
    p2A.x = dp3 * s.dx;
    p2A.y = dp3 * s.dy;

    //Find the dot product of c2 and the surface's left normal (s.lx and s.ly)
    let dp4 = c2.motion.x * (s.lx / s.length) + c2.motion.y * (s.ly / s.length);

    //Project c2's velocity onto the surface's left normal
    p2B.x = dp4 * (s.lx / s.length);
    p2B.y = dp4 * (s.ly / s.length);

    //4. Calculate the bounce vectors

    //Bounce c1
    //using p1B and p2A
    c1.bounce = {};
    c1.bounce.x = p1B.x + p2A.x;
    c1.bounce.y = p1B.y + p2A.y;

    //Bounce c2
    //using p1A and p2B
    c2.bounce = {};
    c2.bounce.x = p1A.x + p2B.x;
    c2.bounce.y = p1A.y + p2B.y;

    //Add the bounce vector to the circles' velocity
    //and add mass if the circle has a mass property
    c1.motion.x = (c1.bounce.x / (c1.radius/min_radius))*2;
    c1.motion.y = (c1.bounce.y / (c1.radius/min_radius))*2;
    c2.motion.x = (c2.bounce.x / (c2.radius/min_radius))*2;
    c2.motion.y = (c2.bounce.y / (c2.radius/min_radius))*2;

}


