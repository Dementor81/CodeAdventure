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

