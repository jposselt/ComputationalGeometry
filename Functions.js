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

    // check if intersection point lies on line segments
    var t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y)*(p3.x - p4.x)) / ((p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y)*(p3.x - p4.x));
    if (t <= 0 || t > 1) {
        return null;
    }

    var u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y)*(p1.x - p3.x)) / ((p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y)*(p3.x - p4.x));
    if (u <= 0 || u > 1) {
        return null;
    }

    return p;
}