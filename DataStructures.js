class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    show(size=5, col=color(0,0,0)) {
        fill(col);
        stroke(col);
        var p = WVTrafo(this.x, this.y);
        circle(p.x, p.y, size);
    }
}

class Polygon {
    constructor(points) {
        this.points = [...points]; // clone the input array
    }
}