let data;

function preload() {
    // Load lines from data file
    // EVERYTHING relying on this data must NOT be used here
    data = loadStrings("UB2_b1_CCW.obj");
}

function setup() {
    let polygons = LoadPolygons(data);
    let e1 = polygons[0].getEvents();
    let e2 = polygons[1].getEvents();
    let events = mergeEvents(e1, e2);
}

function draw() {
    
}