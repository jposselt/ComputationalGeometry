// A half-edge based mesh class used for triangulating polygons

// Holds the dual graph of a triangulized mesh
class DualGraph {
    constructor() {
        this.vertices = [];     // simplified vertices; only contains (x,y) pairs
        this.edges    = [];     // edges are pairs of indices into the vertex array
    }

    // draw the graph
    draw() {
        // TODO
    }
}

// Vertex types used for tringulation
const VType= {
    START:   0,
    END:     1,
    SPLIT:   2,
    MERGE:   3,
    REGULAR: 4
}

// Half-edges are directed line segments
class HalfEdge {
    constructor() {
        this.next = null;       // successor half-edge
        this.previous = null;   // predecessor half-edge
        this.pair = null;       // reversed half-edge

        this.origin = null;     // origin vertex
        this.left = null;       // adjacent polygon
        this.edge = null;       // associated edge
    }
}

// Edges are undirected line segments
class Edge {
    constructor(halfedge) {
        this.halfedge = halfedge;   // associated half-edge
    }

    // draw this edge
    draw() {
        // TODO
    }
}

// Vertices are 2d points
class Vertex {
    constructor(x,y,h) {
        this.x = x;             // x-coordinate
        this.y = y;             // y-coordinate
        this.halfedge = h;      // out-going half-edge
        //this.type = null;       // classification for monotone partitioning
    }

    previous() {
        return this.halfedge.pair.next.next.origin;
    }

    next() {
        return this.halfedge.next.origin;
    }

    // draw this vertex
    draw() {
        // TODO
    }
}

// Polygons are the faces of the mesh structure
class Polygon {
    constructor() {
        this.halfedge = null;   // a half-edge adjacent to the polygon
    }
}

class Mesh {
    constructor() {
        //this.halfedges = [];    // List of half-edges
        this.edges     = [];    // List of edges (basically a subset of the half-edges)
        this.vertices  = [];    // List of vertices
        this.polygons  = [];    // List of polygons
        this.dual = null;       // Dual graph
        this.isTriangulized = false;
        this.isMonotonized = false
    }

    // initialize the mesh from a list of 2d points forming a CCW polygon
    init(points) {
        // create initial polygon
        let p = new Polygon();
        this.polygons.push(p);

        // create vertices, half-edge pairs and edges
        points.forEach(p => {
            // half-edge pair
            let h = new HalfEdge();
            let hp = new HalfEdge();
            h.pair = hp;
            hp.pair = h;
    
            // vertex and edge
            let v = new Vertex(p.x, p.y, h);
            let e = new Edge(h);

            // fill arrays
            this.vertices.push(v);
            this.edges.push(e);
        });

        // set half-edge connections
        for (let i = 0; i < this.vertices.length; i++) {
            const v = this.vertices[i];
            const e = this.edges[i];
            let h = v.halfedge;

            // connect face to the first half-edge
            if (i === 0) {
                p.halfedge = h;
            }

            // set associated origin, face and edge
            h.origin = v;
            h.left = p;
            h.edge = e;

            // set previous and next half edges
            let inext = (i + 1) % this.vertices.length;
            let iprev = (i - 1) < 0 ? this.vertices.length - 1 : i - 1;
            h.next = this.vertices[inext].halfedge;
            h.previous = this.vertices[iprev].halfedge;

            // set the paired edges connections
            let hp = h.pair
            hp.origin = this.vertices[inext];
            hp.left = null;                     // CW boundary edges have no associated face
            hp.edge = e;                        // same as paired edge
            hp.next = h.previous.pair;
            hp.previous = h.next.pair;
        }
    }

    // check if first vertex is below second vertex
    below(v1, v2) {
        if (v1.y < v2.y) {
            return true;
        } else if (v1.y == v2.y) {
            if (v1.x < v2.x) {
                return true;
            }
        }
        return false;
    }

    // check if three vertices form a right-turn
    is_convex(v1, v2, v3) {
        var tmp = (v3.y - v1.y) * (v2.x - v1.x) - (v3.x - v1.x) * (v2.y - v1.y);
        if (tmp > 0) {
            return true;
        } else {
            return false;
        }
    }

    // determine vertex types
    vertex_type(vertex) {
        vprev = vertex.previous();
        vnext = vertex.next();

        if (below(vprev.p, v.p) && below(vnext.p, v.p)) {
            if (is_convex(vnext.p, vprev.p, v.p)) {
                return VType.START;
            } else {
                return VType.SPLIT;
            }
        } else if (below(v.p, vprev.p) && below(v.p, vnext.p)) {
            if (is_convex(vnext.p, vprev.p, v.p)) {
                return VType.END;
            } else {
                return VType.MERGE;
            }
        } else {
            return VType.REGULAR;
        }
    }

    // add an edge to the mesh
    add_edge(from_vertex, to_vertex) {
        // TODO
    }

    // triangulates the mesh by first partitioning its faces into monotone polygons
    triangulate() {
        // TODO
    }

    // triangulates a monotone polygon
    triangulate_monotone() {
        // TODO
    }

    // partitions a polygon into monotone polygons
    monotone_partition() {
        // TODO
    }

    // returns the dual graph of the triangulized mesh
    dual_graph() {
        // TODO
    }

    // draw the mesh
    draw() {
        this.edges.forEach(e => {
            stroke(color(0,0,0));
            strokeWeight(2);

            if (e != null) {
                var p = WVTrafo(e.halfedge.origin.x, e.halfedge.origin.y);
                var q = WVTrafo(e.halfedge.next.origin.x, e.halfedge.next.origin.y);
                line(p.x, p.y, q.x, q.y);
            }
        });

        this.vertices.forEach(v => {
            fill(color(0,0,0));
            stroke(color(0,0,0));
            var p = WVTrafo(v.x, v.y);
            circle(p.x, p.y, 5);
        });
    }

    // draw the dual graph
    draw_dual_graph() {
        if (this.dual !== null) {
            this.dual.draw();
        }
    }
}

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