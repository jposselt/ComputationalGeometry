var mesh = new Mesh();

function preload() {
    // Load lines from data file
    // EVERYTHING relying on this data must NOT be used here
    data = loadStrings("UB5_T1_CCW.obj");
}

function setup() {

    let points = [];
    let polygons = [];
    data.forEach(line => {
        let tokens = splitTokens(trim(line));
        if (tokens.length > 0) {
            // non-empty lines are assumed to be valid
            // no checks are made

            // vertices
            if (tokens[0] == 'v') {
                points.push(
                    {x: parseFloat(tokens[1]),
                     y: parseFloat(tokens[2])}
                );
            }

            // faces
            if (tokens[0] == 'f') {
                let polyPoints = [];
                for (i = 1; i < tokens.length; i++) {
                    polyPoints.push(
                        points[parseInt(tokens[i]) - 1]
                    );
                }
                polygons.push(polyPoints);
            }
            
        }
    });

    mesh.init(polygons[0]);

    frameRate(1);
    createCanvas(500, 500);
}

function draw() {
    clear();
    mesh.draw(true);
}