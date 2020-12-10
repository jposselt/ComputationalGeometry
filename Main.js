// World coordinates limits
const maxX = 510,
      maxY = 510;
const minX = -10,
      minY = -10;

let poly1;
let poly2;
let steps;
let idx = 0;

function preload() {
    // Load lines from data file
    // EVERYTHING relying on this data must NOT be used here
    data = loadStrings("UB2_b1_CCW.obj");
}

function setup() {
    let polygons = loadPolygons(data);

    poly1 = polygons[0];
    poly2 = polygons[1];

    let e1 = polygons[0].getEvents();
    let e2 = polygons[1].getEvents();
    let events = mergeEvents(e1, e2);
    let intersections = findPolygonIntersections(events, polygons[0], polygons[1]);
    console.log(intersections.result);
    steps = intersections.stp;

    frameRate(1);
    createCanvas(500, 500);
}

function draw() {
    clear();

    poly1.show();
    poly2.show();

    step = steps[idx]
    var ev = step.event;
    var ed1 = step.edges_1;
    var ed2 = step.edges_2;
    var ipoints = step.isec

    showScanLine(ev, 1, color(255,0,0));
    //showActiveEdges(ed1, 2, color(0,0,255));
    //showActiveEdges(ed2, 2, color(0,255,0));

    ipoints.forEach(ip => {
        var p = new Point2D(ip.x, ip.y);
        p.show(5, color(255,0,0));
    });

    idx = (idx + 1) % steps.length
}