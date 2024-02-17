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

Array.prototype.last = function (item) {
    return this.slice(-1)[0];
}

function rad(deg) {
    return deg * (Math.PI / 180);
}

const geometry = {
    PRECISION: 3,
    distance: function (p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)).round(this.PRECISION);
    },
    length: function (v) {
        return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2)).round(this.PRECISION);
    },
    slope: function (p1, p2) {
        return (p1.y - p2.y) / (p1.x - p2.x);
    },

    //checks if point c is between a and b
    within: function (pA, pB, pC, exclude) {
        if (exclude && (deepEqual(pA, pC) || deepEqual(pB, pC))) return false;
        if (pC.x.outoff(pA.x, pB.x) || pC.y.outoff(pA.y, pB.y)) return false;
        return (pB.x - pA.x) * (pC.y - pA.y) == (pC.x - pA.x) * (pB.y - pA.y);
    },
    getIntersectionPoint: function (line1, line2) {
        const denominator = (line2.end.y - line2.start.y) * (line1.end.x - line1.start.x) - (line2.end.x - line2.start.x) * (line1.end.y - line1.start.y);

        // If the denominator is 0, the lines are parallel and don't intersect
        if (denominator === 0) {
            return null;
        }

        const ua = ((line2.end.x - line2.start.x) * (line1.start.y - line2.start.y) - (line2.end.y - line2.start.y) * (line1.start.x - line2.start.x)) / denominator;
        const ub = ((line1.end.x - line1.start.x) * (line1.start.y - line2.start.y) - (line1.end.y - line1.start.y) * (line1.start.x - line2.start.x)) / denominator;

        // If ua or ub is less than 0 or greater than 1, the intersection point is outside of the segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return null;
        }

        // Calculate the intersection point
        const intersectionX = line1.start.x + ua * (line1.end.x - line1.start.x);
        const intersectionY = line1.start.y + ua * (line1.end.y - line1.start.y);

        return new Point(intersectionX, intersectionY);
    },
    pointOnLine: function (point1, point2, targetPoint) {
        // Extract coordinates from the objects
        let x1 = point1.x,
            y1 = point1.y;
        let x2 = point2.x,
            y2 = point2.y;
        let px = targetPoint.x,
            py = targetPoint.y;

        // Calculate parameters for the parametric equations
        let tX = px == x1 && x1 == x2 ? 0 : (px - x1) / (x2 - x1);
        let tY = py == y1 && y1 == y2 ? 0 : (py - y1) / (y2 - y1);

        // Check if the point is on the line (within the segment boundaries)
        if (tX >= 0 && tX <= 1 && tY >= 0 && tY <= 1) {
            return true; // Point lies on the line segment
        } else {
            return false; // Point is outside the line segment
        }
    },

    //calculates a point which is perpendicular to the given vector
    perpendicular: function (p, deg, distance) {
        return {
            y: p.y + Math.sin(deg2rad(deg + 90)) * distance,
            x: p.x + Math.cos(deg2rad(deg + 90)) * distance,
        };
    },

    parallel: function (deg, distance) {
        return {
            y: Math.sin(deg2rad(deg)) * -distance,
            x: Math.cos(deg2rad(deg)) * distance,
        };
    },

    //returns the unit vector of the given vector
    unit: function (v, l) {
        const length = l ? l : this.length(v);
        return this.multiply(v, 1 / length);
    },

    multiply: function (v, s) {
        return {
            x: (v.x * s).round(this.PRECISION),
            y: (v.y * s).round(this.PRECISION),
        };
    },

    add: function (v1, v2) {
        return { x: v1.x + v2.x, y: v1.y + v2.y };
    },

    sub: function (v1, v2) {
        return { x: v1.x - v2.x, y: v1.y - v2.y };
    },

    flipY: (v) => ({ x: v.x, y: v.y * -1 }),

    round: (v) => ({ x: Math.round(v.x), y: Math.round(v.y) }),
};

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

    /*  mult(f) {
         return new Vector(f * this.x, f * this.y)
     }
 
     unit() {
         return this.mult(1 / this.length);
     } */
}

