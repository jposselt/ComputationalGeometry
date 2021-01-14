// Node class
class Node {
    constructor(data) {
        this.data = data;
        this.left = null;
        this.right = null;
    }
}


// Binary Search tree class
class BinarySearchTree {
    constructor() {
        // root of a binary seach tree
        this.root = null;
    }

    // dataA < dataB
    comparator_less(dataA, dataB) {
        return edge_compare(dataA.edge, dataB.edge);
    }

    // dataA > dataB
    comparator_more(dataA, dataB) {
        return edge_compare(dataB.edge, dataA.edge);
    }

    // helper method which creates a new node to
    // be inserted and calls insertNode
    insert(data) {
        // Creating a node and initailising
        // with data
        var newNode = new Node(data);

        // root is null then node will
        // be added to the tree and made root.
        if(this.root === null) {
            this.root = newNode;
        } else {
            // find the correct position in the
            // tree and add the node
            this.insertNode(this.root, newNode);
        }
    } 
  
    // Method to insert a node in a tree
    // it moves over the tree to find the location
    // to insert a node with a given data
    insertNode(node, newNode) {
        // if the data is less than the node
        // data move left of the tree
        if(this.comparator_less(newNode.data, node.data)) {
            // if left is null insert node here
            if(node.left === null) {
                node.left = newNode;
            } else {
                // if left is not null recur until
                // null is found
                this.insertNode(node.left, newNode);
            }
        }

        // if the data is more than the node
        // data move right of the tree
        else {
            // if right is null insert node here
            if(node.right === null) {
                node.right = newNode;
            } else {
                // if right is not null recur until
                // null is found
                this.insertNode(node.right,newNode);
            }
        }
    }

    // helper method that calls the 
    // removeNode with a given data 
    remove(data) { 
	    // root is re-initialized with 
	    // root of a modified tree. 
	    this.root = this.removeNode(this.root, data); 
    } 

    // Method to remove node with a given data
    // it recursively walks over the tree to find the
    // data and removes it
    removeNode(node, key) {
	    // if the root is null then tree is empty
	    if(node === null)
		    return null;

	    // if data to be delete is less than
	    // roots data then move to left subtree
	    else if(this.comparator_less(key, node.data)) {
            node.left = this.removeNode(node.left, key);
		    return node;
	    }

	    // if data to be delete is greater than
	    // roots data then move to right subtree
	    else if(this.comparator_more(key, node.data)) {
		    node.right = this.removeNode(node.right, key);
		    return node;
	    }

	    // if data is similar to the root's data
	    // then delete this node
	    else {
		    // deleting node with no children
		    if(node.left === null && node.right === null) {
			    node = null;
			    return node;
		    }

		    // deleting node with one children
		    if(node.left === null) {
			    node = node.right;
			    return node;
		    } else if(node.right === null) {
			    node = node.left;
			    return node;
		    }

		    // Deleting node with two children
		    // minumum node of the rigt subtree
		    // is stored in aux
		    var aux = this.findMinNode(node.right);
		    node.data = aux.data;

		    node.right = this.removeNode(node.right, aux.data);
		    return node;
	    }
    }

    // search for a node with given edge
    search(node, edge) {
        // if trees is empty return null
	    if(node === null)
		    return null;

	    // if edge is less than node's edge
	    // move left
	    else if(edge_compare(edge, node.data.edge))
		    return this.search(node.left, edge);

	    // if edge is greater than node's edge
	    // move left
	    else if(edge_compare(node.data.edge, edge))
		    return this.search(node.right, edge);

	    // if edge is equal to the node edge
	    // return node
	    else
		    return node;
    }

    // search the tree for the first element that
    // is not less than the given edge
    search_lower(node, edge) {
        // if trees is empty return null
	    if(node === null)
            return null;

        // if edge is less than node's edge
	    // move left
        else if(edge_compare(edge, node.data.edge))
            return this.search_lower(node.left, edge);

        // if edge is equal or greater than node's edge
        // check right node
        else {
            var result = this.search_lower(node.right, edge);
            if(result === null) {
                return node;
            } else {
                return result;
            }
        }
    }

    // finds the minimum node in tree
    // searching starts from given node
    findMinNode(node)
    {
        // if left of a node is null
        // then it must be minimum node
        if(node.left === null)
            return node;
        else
            return this.findMinNode(node.left);
    }
}
