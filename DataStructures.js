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

class Line2D {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }
    
    show(width=2, col=color(0,0,0)) {
        stroke(col);
        strokeWeight(width);
        var tp1 = WVTrafo(this.p1.x, this.p1.y);
        var tp2 = WVTrafo(this.p2.x, this.p2.y);
        line(tp1.x, tp1.y, tp2.x, tp2.y);
    }
}

class LLNode {
    constructor(point) {
        this.point = point;
        this.nextCW = null;
        this.nextCCW = null;
    }
}

class Polygon {
    constructor(points) {
        this.points = [...points]; // clone the input array
        this.nodes = [];
        this.leftMostNode = null;
        this.rightMostNode = null;

        // Construct a linked-list like node for each polygon point
        this.points.forEach(element => {
            this.nodes.push(new LLNode(element));
        });

        // Fill in links between nodes
        for (let index = 0; index < this.nodes.length; index++) {
            var node = this.nodes[index];
            if (index == 0) {
                node.nextCCW = this.nodes[index + 1];
                node.nextCW = this.nodes[this.nodes.length - 1];
            } else if (index == this.nodes.length - 1) {
                node.nextCCW = this.nodes[0];
                node.nextCW = this.nodes[index - 1];
            } else {
                node.nextCCW = this.nodes[index + 1];
                node.nextCW = this.nodes[index - 1];
            }
        }

        // Find nodes containing the point with the smallest/largest x-coordinate
        // If several points have the same x-coordinate chose the one with smaller
        // y-coordinate
        this.nodes.forEach(element => {
            if (this.leftMostNode == null) {
                this.leftMostNode = element;
                this.rightMostNode = element;
            } else if (element.point.x < this.leftMostNode.point.x) {
                this.leftMostNode = element;
            } else if (element.point.x == this.leftMostNode.point.x) {
                if (element.point.y < this.leftMostNode.point.y) {
                    this.leftMostNode = element;
                }
            } else if (element.point.x > this.rightMostNode.point.x) {
                this.rightMostNode = element;
            } else if (element.point.x == this.rightMostNode.point.x) {
                if (element.point.y < this.rightMostNode.point.y) {
                    this.rightMostNode = element;
                }
            }
        });
    }

    getEvents() {
        var events = new Array();
        events.push(this.leftMostNode.point.x); // left most node is always first

        var cw = this.leftMostNode.nextCW;
        var ccw = this.leftMostNode.nextCCW;
        while (cw.nextCCW != ccw) { // Abort condition: CW moved past CCW
            // Right most point reached: add event and end loop
            if (cw == ccw) {
                events.push(cw.point.x);
                break;
            }

            // Don't add events if movement is paralell to y-axis. This can only
            // occur on the left/right side of a (convex) polygon. Adding events
            // for these cases is done somewhere else.
            if (cw.point.x == this.leftMostNode.point.x) {
                cw = cw.nextCW;
                continue;
            }
            if (ccw.point.x == this.rightMostNode.point.x) {
                ccw = ccw.nextCCW;
                continue;
            }

            // Add only one event for two points with same x-coordinate
            if (cw.point.x == ccw.point.x) {
                events.push(cw.point.x);
                cw = cw.nextCW;
                ccw = ccw.nextCCW;
                continue;
            }

            // Add new event
            if (cw.point.x > ccw.point.x) {
                events.push(ccw.point.x);
                ccw = ccw.nextCCW;
            } else {
                events.push(cw.point.x);
                cw = cw.nextCW;
            }
        }

        return events;
    }
}