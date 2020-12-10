// Window-Viewport Transformation
function WVTrafo(x_w, y_w,                                        // World coordinates
                 x_wmax=510, y_wmax=510, x_wmin=-10, y_wmin=-10,  // Window boundaries
                 x_vmax=width, y_vmax=height, x_vmin=0, y_vmin=0  // Viewport boundaries
                )
{
    // calculatng Sx and Sy
    const sx = (x_vmax - x_vmin) / (x_wmax - x_wmin);
    const sy = (y_vmax - y_vmin) / (y_wmax - y_wmin);

    // calculating the point on viewport 
    const x_v = x_vmin + ((x_w - x_wmin) * sx);
    const y_v = y_vmin + ((y_w - y_wmin) * sy);

    return {
        x: x_v,
        y: height - y_v // invert y-coordinate
    };
}

// Load polygons from a simplified obj format
function loadPolygons(lines) {
    var points = [];
    var polygons = new Array();

    lines.forEach(line => {
        var tokens = splitTokens(trim(line));

        if (tokens.length > 0) {
            // non-empty lines are assumed to be valid
            // no checks are made

            // vertices
            if (tokens[0] == 'v') {
                points.push(
                    new Point2D(
                        parseFloat(tokens[1]), // x-coordinate
                        parseFloat(tokens[2])  // y-coordinate
                    )
                );
            }

            // faces
            if (tokens[0] == 'f') {
                var polyPoints = [];
                for (i = 1; i < tokens.length; i++) {
                    polyPoints.push(
                        points[parseInt(tokens[i]) - 1]
                    );
                }
                polygons.push(new Polygon(polyPoints));
            }
            
        }
    });

    return polygons;
}

function mergeEvents(events1, events2) {
    var e1 = [...events1];
    var e2 = [...events2];
    var merged = new Array();

    while (e1.length > 0 || e2.length > 0) {
        if (e2.length === 0) {
            merged.push(e1.shift());
        } else if (e1.length === 0) {
            merged.push(e2.shift());
        } else {
            if (e1[0] < e2[0]) {
                merged.push(e1.shift());
            } else if (e1[0] > e2[0]) {
                merged.push(e2.shift());
            } else {
                merged.push(e1.shift());
                e2.shift();
            }
        }
    }

    return merged;
}

function findPolygonIntersections(events, poly1, poly2) {
    var steps = [];
    var intersections = new Array();

    if (poly1.rightMostNode.point.x < poly2.leftMostNode.point.x) {
        return intersections;
    }
    if (poly2.rightMostNode.point.x < poly1.leftMostNode.point.x) {
        return intersections;
    }

    var es = [...events]; // clone events
    var sss = {
        p1_cw: null,
        p1_ccw: null,
        p2_cw: null,
        p2_ccw: null
    };

    while (es.length > 0) {
        e = es.shift();
        p1_active = [];
        p2_active = [];

        // reached left edge of 1st polygon
        if (e == poly1.leftMostNode.point.x) {
            // set initial edges for 1st polygon in ScanLineState
            sss.p1_cw  = {start: poly1.leftMostNode, end: poly1.leftMostNode.nextCW};
            sss.p1_ccw = {start: poly1.leftMostNode, end: poly1.leftMostNode.nextCCW};

            p1_active.push(sss.p1_cw);
            p1_active.push(sss.p1_ccw);

            // check for intersections
            var iPoint = findLineIntersection(sss.p1_cw, sss.p2_cw);
            if (iPoint != null) {
                intersections.push(iPoint);
            }
            iPoint = findLineIntersection(sss.p1_ccw, sss.p2_cw);
            if (iPoint != null) {
                intersections.push(iPoint);
            }
            iPoint = findLineIntersection(sss.p1_cw, sss.p2_ccw);
            if (iPoint != null) {
                intersections.push(iPoint);
            }
            iPoint = findLineIntersection(sss.p1_ccw, sss.p2_ccw);
            if (iPoint != null) {
                intersections.push(iPoint);
            }

            // special case: polygon has edge(s) parallel to scan line
            while (sss.p1_cw.start.point.x == sss.p1_cw.end.point.x) {
                // update CW edge
                sss.p1_cw.start = sss.p1_cw.end;
                sss.p1_cw.end   = sss.p1_cw.end.nextCW;

                p1_active.push(sss.p1_cw);

                // check intersections with new edge
                iPoint = findLineIntersection(sss.p1_cw, sss.p2_cw);
                if (iPoint != null) {
                    intersections.push(iPoint);
                }
                iPoint = findLineIntersection(sss.p1_cw, sss.p2_ccw);
                if (iPoint != null) {
                    intersections.push(iPoint);
                }
            }
        }

        // reached left edge of 2nd polygon
        if (e == poly2.leftMostNode.point.x) {
            // set initial edges for 2nd polygon in ScanLineState
            sss.p2_cw  = {start: poly2.leftMostNode, end: poly2.leftMostNode.nextCW};
            sss.p2_ccw = {start: poly2.leftMostNode, end: poly2.leftMostNode.nextCCW};

            p2_active.push(sss.p2_cw);
            p2_active.push(sss.p2_ccw);

            // check for intersections
            var iPoint = findLineIntersection(sss.p1_cw, sss.p2_cw);
            if (iPoint != null) {
                intersections.push(iPoint);
            }
            iPoint = findLineIntersection(sss.p1_ccw, sss.p2_cw);
            if (iPoint != null) {
                intersections.push(iPoint);
            }
            iPoint = findLineIntersection(sss.p1_cw, sss.p2_ccw);
            if (iPoint != null) {
                intersections.push(iPoint);
            }
            iPoint = findLineIntersection(sss.p1_ccw, sss.p2_ccw);
            if (iPoint != null) {
                intersections.push(iPoint);
            }

            // special case: polygon has edge(s) parallel to scan line
            while (sss.p2_cw.start.point.x == sss.p2_cw.end.point.x) {
                // update CW edge
                sss.p2_cw.start = sss.p2_cw.end;
                sss.p2_cw.end   = sss.p2_cw.end.nextCW;

                p2_active.push(sss.p2_cw);

                // check intersections with new edge
                var iPoint = findLineIntersection(sss.p2_cw, sss.p1_cw);
                if (iPoint != null) {
                    intersections.push(iPoint);
                }
                iPoint = findLineIntersection(sss.p2_cw, sss.p1_ccw);
                if (iPoint != null) {
                    intersections.push(iPoint);
                }
            }
        }

        // Update scan line state for 1st polygon
        if (e == poly1.rightMostNode.point.x) { // right most extension reached

            // iterate CW edge until it meets the CCW edge
            while (sss.p1_cw.end.point.y != sss.p1_ccw.end.point.y) {
                sss.p1_cw.start = sss.p1_cw.end;
                sss.p1_cw.end   = sss.p1_cw.end.nextCW;

                p1_active.push(sss.p1_cw);

                var i1 = findLineIntersection(sss.p1_cw, sss.p2_cw);
                var i2 = findLineIntersection(sss.p1_cw, sss.p2_ccw);

                if (i1 != null) {
                    intersections.push(i1);
                }
                if (i2 != null) {
                    intersections.push(i2);
                }
            }

            // polygon done
            sss.p1_cw = null;
            sss.p1_ccw = null;

        } else { // general case
            // CW edge
            if (sss.p1_cw != null && e == sss.p1_cw.end.point.x) {
                sss.p1_cw.start = sss.p1_cw.end;
                sss.p1_cw.end   = sss.p1_cw.end.nextCW;

                p1_active.push(sss.p1_cw);

                var i1 = findLineIntersection(sss.p1_cw, sss.p2_cw);
                var i2 = findLineIntersection(sss.p1_cw, sss.p2_ccw);

                if (i1 != null) {
                    intersections.push(i1);
                }
                if (i2 != null) {
                    intersections.push(i2);
                }
            }

            // CCW edge
            if (sss.p1_ccw != null && e == sss.p1_ccw.end.point.x) {
                sss.p1_ccw.start = sss.p1_ccw.end;
                sss.p1_ccw.end   = sss.p1_ccw.end.nextCCW;

                p1_active.push(sss.p1_ccw);

                var i1 = findLineIntersection(sss.p1_ccw, sss.p2_cw);
                var i2 = findLineIntersection(sss.p1_ccw, sss.p2_ccw);

                if (i1 != null) {
                    intersections.push(i1);
                }
                if (i2 != null) {
                    intersections.push(i2);
                }
            }
        }

        // Update scan line state for 2nd polygon
        if (e == poly2.rightMostNode.point.x) { // right most extension reached

            // iterate CW edge until it meets the CCW edge
            while (sss.p2_cw.end.point.y != sss.p2_ccw.end.point.y) {
                sss.p2_cw.start = sss.p2_cw.end;
                sss.p2_cw.end   = sss.p2_cw.end.nextCW;

                p2_active.push(sss.p2_cw);

                var i1 = findLineIntersection(sss.p1_cw, sss.p2_cw);
                var i2 = findLineIntersection(sss.p1_ccw, sss.p2_cw);

                if (i1 != null) {
                    intersections.push(i1);
                }
                if (i2 != null) {
                    intersections.push(i2);
                }
            }

            // polygon done
            sss.p2_cw = null;
            sss.p2_ccw = null;
            
        } else { // general case
            // CW edge
            if (sss.p2_cw != null && e == sss.p2_cw.end.point.x) {
                sss.p2_cw.start = sss.p2_cw.end;
                sss.p2_cw.end   = sss.p2_cw.end.nextCW;

                p2_active.push(sss.p2_cw);

                var i1 = findLineIntersection(sss.p2_cw, sss.p1_cw);
                var i2 = findLineIntersection(sss.p2_cw, sss.p1_ccw);

                if (i1 != null) {
                    intersections.push(i1);
                }
                if (i2 != null) {
                    intersections.push(i2);
                }
            }

            // CCW edge
            if (sss.p2_ccw != null && e == sss.p2_ccw.end.point.x) {
                sss.p2_ccw.start = sss.p2_ccw.end;
                sss.p2_ccw.end   = sss.p2_ccw.end.nextCCW;

                p2_active.push(sss.p2_ccw);

                var i1 = findLineIntersection(sss.p2_ccw, sss.p1_cw);
                var i2 = findLineIntersection(sss.p2_ccw, sss.p1_ccw);

                if (i1 != null) {
                    intersections.push(i1);
                }
                if (i2 != null) {
                    intersections.push(i2);
                }
            }
        }

        steps.push(
            {
                event: e, 
                edges_1: [...p1_active],
                edges_2: [...p2_active], 
                isec: [...intersections]
            }
        );
    }

    return {result: intersections, stp: steps};
}

function findLineIntersection(line1, line2) {

    if (line1 == null || line2 == null) {
        return null;
    }

    var p1 = {x: line1.start.point.x, y: line1.start.point.y};
    var p2 = {x: line1.end.point.x,   y: line1.end.point.y}
    var p3 = {x: line2.start.point.x, y: line2.start.point.y}
    var p4 = {x: line2.end.point.x,   y: line2.end.point.y}

    // down part of intersection point formula
    var d1 = (p1.x - p2.x) * (p3.y - p4.y); // (x1 - x2) * (y3 - y4)
    var d2 = (p1.y - p2.y) * (p3.x - p4.x); // (y1 - y2) * (x3 - x4)
    var d  = (d1) - (d2);

    if(d == 0) {
        return null;
    }

    // down part of intersection point formula
    var u1 = (p1.x * p2.y - p1.y * p2.x); // (x1 * y2 - y1 * x2)
    var u4 = (p3.x * p4.y - p3.y * p4.x); // (x3 * y4 - y3 * x4)

    var u2x = p3.x - p4.x; // (x3 - x4)
    var u3x = p1.x - p2.x; // (x1 - x2)
    var u2y = p3.y - p4.y; // (y3 - y4)
    var u3y = p1.y - p2.y; // (y1 - y2)

    // intersection point formula
    var px = (u1 * u2x - u3x * u4) / d;
    var py = (u1 * u2y - u3y * u4) / d;

    var p = { x: px, y: py };

    // check if intersection point lies on line segment
    var t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y)*(p3.x - p4.x)) / ((p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y)*(p3.x - p4.x));
    if (t < 0 || t > 1) {
        return null;
    }

    return p;
}

function showScanLine(event, width=1, col=color(0,0,0)) {
    stroke(col);
    strokeWeight(width);

    var p = WVTrafo(event, -10);
    var q = WVTrafo(event, 510);
    line(p.x, p.y, q.x, q.y);
}

function showActiveEdges(edges, width=1, col=color(0,0,0)) {
    stroke(col);
    strokeWeight(width);

    edges.forEach(edge => {
        var p = WVTrafo(edge.start.point.x, edge.start.point.y);
        var q = WVTrafo(edge.end.point.x, edge.end.point.y);
        line(p.x, p.y, q.x, q.y);
    });
}