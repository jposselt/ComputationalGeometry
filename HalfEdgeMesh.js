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
        this.color = null;
    }

    // draw this edge
    draw() {
        if (this.color === null) {
            stroke(color(0,0,0));
        } else {
            stroke(this.color);
        }
        strokeWeight(2);

        var p = WVTrafo(this.halfedge.origin.x, this.halfedge.origin.y);
        var q = WVTrafo(this.halfedge.next.origin.x, this.halfedge.next.origin.y);
        line(p.x, p.y, q.x, q.y);
    }
}

// Vertices are 2d points
class Vertex {
    constructor(x,y,h) {
        this.x = x;             // x-coordinate
        this.y = y;             // y-coordinate
        this.halfedge = h;      // out-going half-edge
        this.type = null;       // classification for monotone partitioning
        this.color = null;      // color
    }

    // get previous vertex
    // may not be well defined after diagonals have been added to the mesh
    previous() {
        return this.halfedge.pair.next.next.origin;
    }

    // get next vertex
    // may not be well defined after diagonals have been added to the mesh
    next() {
        return this.halfedge.next.origin;
    }

    // draw this vertex
    draw(show_type = false, vsize = 10) {
        let c = color(0,0,0);   // default color

        // use stored color if available
        if (this.color !== null) {
            c = color;
        }

        // set fill an stroke to chosen color
        fill(c);
        stroke(c);

        // type determines vertex shape
        if (show_type) {
            let t = this.type;

            // calculate vertex type if not set
            if (t === null) {
                t = vertex_type(this);
            }

            // transform vertex position to device coordinates
            var p = WVTrafo(this.x, this.y);

            // draw shape according to type
            switch (t) {
                case VType.START:
                    circle(p.x, p.y, vsize);
                    break;

                case VType.END:
                    rect(p.x - 5, p.y -5, vsize, vsize);
                    break;

                case VType.SPLIT:
                    angleMode(DEGREES);
                    const rs = vsize/2.;

                    var ax = p.x + rs * sin(240);
                    var ay = p.y - rs * cos(240);

                    var bx = p.x + rs * sin(120);
                    var by = p.y - rs * cos(120);

                    var cx = p.x;
                    var cy = p.y - rs;

                    triangle(ax, ay, bx, by, cx, cy)
                    break;

                case VType.MERGE:
                    angleMode(DEGREES);
                    const rm = vsize/2.;

                    var ax = p.x + rm * sin(240);
                    var ay = p.y + rm * cos(240);

                    var bx = p.x + rm * sin(120);
                    var by = p.y + rm * cos(120);

                    var cx = p.x;
                    var cy = p.y + rm;

                    triangle(ax, ay, bx, by, cx, cy)
                    break;

                case VType.REGULAR:
                    const h = vsize*sqrt(2.)/2;
                    quad(
                        p.x + h, p.y,
                        p.x, p.y + h,
                        p.x - h, p.y ,
                        p.x, p.y -h
                        )
                    break;
            }
        }
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
            hp.edge = e;                        // same as paired half-edge
            hp.next = h.previous.pair;
            hp.previous = h.next.pair;
        }
    }

    // add a diagonal between two vertices to the mesh
    add_diagonal(from_vertex, to_vertex, col=color(255, 200, 0)) {
        // create a new edge and two half-edges
        let from_to_half = new HalfEdge();
        let to_from_half = new HalfEdge();
        let edge = new Edge(from_to_half);
        
        // set edge color
        edge.color = col;

        // connect new half-edges to the new edge
        from_to_half.edge = edge;
        to_from_half.edge = edge;

        // connect new half-edges to the vertices
        from_to_half.origin = from_vertex;
        to_from_half.origin = to_vertex;

        // pair new half-edges with each other
        from_to_half.pair = to_from_half;
        to_from_half.pair = from_to_half

        // connect new half-edges into a loop
        // allows edge to be drawn even though it is not yet properly connected to the rest of the mesh
        from_to_half.previous = to_from_half;
        from_to_half.next = to_from_half;
        to_from_half.previous = from_to_half;
        to_from_half.next = from_to_half;

        // find the half-edges on the vertices that need to be connected to the new edge
        // these half-edges all have the same face on their left
        let from_in, from_out, to_in, to_out;
        let success = false;
        // iterate over outgoing half-edges of the from_vertex
        let he0 = from_vertex.halfedge;
        const he0_start = from_vertex.halfedge;
        do {
            from_out = he0;
            from_in  = he0.previous;

            // iterate over outgoing half-edges of the to_vertex
            let he1 = to_vertex.halfedge;
            const he1_start = to_vertex.halfedge;
            do {
                to_out = he1;
                to_in  = he1.previous;

                // all bordering same face?
                if (from_out.left === from_in.left && to_out.left === to_in.left && from_out.left === to_out.left) {
                    success = true;
                    break;
                }

                he1 = he1.pair.next // get next outgoing half-edge
            } while (he1 !== he1_start);

            if (success) {
                break;
            }

            he0 = he0.pair.next // get next outgoing half-edge
        } while (he0 !== he0_start)

        // throw error if search failed
        if (!success) {
            throw 'error finding neighboring half edges when inserting edge';
        }

        // link the from-side of the edge
        from_to_half.previous = from_in;
        from_in.next = from_to_half;
        to_from_half.next = from_out;
        from_out.previous = to_from_half;

        // link the to-side of the edge
        from_to_half.next = to_out;
        to_out.previous = from_to_half;
        to_from_half.previous = to_in;
        to_in.next =  to_from_half;

        // update the face-to-half-edge connections for the two new half-edge loops
        to_from_half.left = from_out.left;
        from_out.left.halfedge = to_from_half;

        let new_face = new Polygon();
        let half = from_to_half;
        const start = from_to_half;
        do {
            half.left = new_face;
            half = half.next;
        } while (half !== start);
        new_face.halfedge = from_to_half;

        // update relevant lists
        this.edges.push(edge);
        this.polygons.push(new_face);
    }

    // test() {
    //     this.add_diagonal(this.vertices[3], this.vertices[8])
    // }

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
        // create priority queue
        let priotity = [...this.vertices];  // shallow copy
        priotity.sort(vertex_sort).reverse();

        //determine vertex types
        this.vertices.forEach(v => {
            v.type = vertex_type(v);
        });

        // initialize BST
        let tree = new BinarySearchTree();

        priotity.forEach(event => {
            let v = event;
            let e = event.halfedge;

            switch (v.type) {
                case VType.START:
                    tree.insert({edge: e, helper: v});
                    break;

                case VType.END:
                    var v_help = tree.search(tree.root, e.previous).data.helper;
                    if(v_help.type ===  VType.MERGE) {
                        this.add_diagonal(v, v_help)
                    }
                    tree.remove({edge: e.previous});
                    break;

                case VType.SPLIT:
                    var node = tree.search_lower(tree.root, e);
                    this.add_diagonal(v, node.data.helper)
                    node.data.helper = v;
                    tree.insert({edge: e, helper: v});
                    break;

                case VType.MERGE:
                    var v_help = tree.search(tree.root, e.previous).data.helper;
                    if(v_help.type === VType.MERGE) {
                        this.add_diagonal(v, v_help);
                    }
                    tree.remove({edge: e.previous});

                    var node = tree.search_lower(tree.root, e);
                    v_help = node.data.helper;
                    if(v_help.type === VType.MERGE) {
                        this.add_diagonal(v, v_help);
                    }
                    node.data.helper = v;
                    break;

                case VType.REGULAR:
                    if(below(v, v.previous())) {
                        var prev_edge = e.previous
                        var v_help = tree.search(tree.root, e.previous).data.helper;
                        if(v_help.type ===  VType.MERGE) {
                            this.add_diagonal(v, v_help)
                        }
                        tree.remove({edge: prev_edge});
                        tree.insert({edge: e, helper: v});
                    } else {
                        var node = tree.search_lower(tree.root, e);
                        var v_help = node.data.helper;
                        if(v_help.type === VType.MERGE) {
                            this.add_diagonal(v, v_help);
                        }
                        node.data.helper = v;
                    }
                    break;
            }
        });
    }

    // calculates the dual graph of the triangulized mesh
    dual_graph() {
        // TODO
    }

    // draw the mesh
    draw(show_types = false) {
        this.edges.forEach(e => {e.draw();});
        this.vertices.forEach(v => {v.draw(show_types);});
    }

    // draw the dual graph
    draw_dual_graph() {
        if (this.dual !== null) {
            this.dual.draw();
        }
    }
}

// Window-Viewport Transformation
function WVTrafo(x_w, y_w,                           // World coordinates
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

// check if first vertex is below second vertex
function below(v1, v2) {
    if (v1.y < v2.y) {
        return true;
    } else if (v1.y == v2.y) {
        if (v1.x < v2.x) {
            return true;
        }
    }
    return false;
}

// check if third point is to the left of line from first to second point
function is_convex(v1, v2, v3) {
    var tmp = (v3.y - v1.y) * (v2.x - v1.x) - (v3.x - v1.x) * (v2.y - v1.y);
    if (tmp > 0) {
        return true;
    } else {
        return false;
    }
}

// determine vertex types
function vertex_type(vertex) {
    let vprev = vertex.previous();
    let vnext = vertex.next();

    if (below(vprev, vertex) && below(vnext, vertex)) {
        if (is_convex(vnext, vprev, vertex)) {
            return VType.START;
        } else {
            return VType.SPLIT;
        }
    } else if (below(vertex, vprev) && below(vertex, vnext)) {
        if (is_convex(vnext, vprev, vertex)) {
            return VType.END;
        } else {
            return VType.MERGE;
        }
    } else {
        return VType.REGULAR;
    }
}

// sort function for vertices
function vertex_sort(v1, v2) {
    if (v1.y > v2.y) {
        return 1;
    } else if (v1.y < v2.y) {
        return -1;
    } else {
        if (v1.x > v2.x) {
            return 1;
        } else if (v1.x < v2.x) {
            return -1;
        }
    }
    return 0;
}

// compare function for edges
function edge_compare(e1, e2) {
    let p1 = e1.origin;
    let p2 = e1.pair.origin;
    let p3 = e2.origin;
    let p4 = e2.pair.origin;

    if (p3.y === p4.y) {
        if (p1.y === p2.y) {
            return (p1.y < p3.y);
        }
        return is_convex(p1, p2, p3);
    } else if (p1.y === p2.y) {
        return !is_convex(p3, p4, p1);
    } else if (p1.y < p3.y) {
        return !is_convex(p3, p4, p1);
    } else {
        return is_convex(p1, p2, p3);
    }
}