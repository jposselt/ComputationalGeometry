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
function LoadPolygons(lines) {
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

    /* var merged = new Array();
    var i = 0;
    var j = 0;
    const l1 = events1.length;
    const l2 = events2.length;

    while (i < l1 || j < l2) {
        if (events1[i] > events2[j]) {
            merged.push(events2[j]);
            j++;
        } else if (events1[i] < events2[j]) {
            merged.push(events1[i]);
            i++;
        } else { // equal
            merged.push(events1[i]);
            i++;
            j++;
        }
    }
    return merged; */
}