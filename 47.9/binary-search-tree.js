/**
 * Node in a binary search tree.
 * 
 * @template T Type of item being contained in this node.
 */
class Node {
    /**
     * Creates a new node.
     * 
     * @param {T} val Value being stored in this node.
     * @param {Node<T>?} parent This node's parent.
     * @param {Node<T>?} left  Left-hand node.
     * @param {Node<T>?} right Right-hand node.
     */
    constructor(val, parent = null, left = null, right = null) {
        this.val = val;

        this.parent = parent;
        this.left = left;
        this.right = right;

        /** @type {'red' | 'black'} */
        this.color = 'red';
    }
}

/**
 * @template T Type of item being contained in this tree.
 */
class BinarySearchTree {
    /**
     * Creates a new binary tree.
     * 
     * @param {Node<T>?} root The root node.
     * @param {(left: T, right: T) => number} compareFn Comparison function.
     */
    constructor(root = null, compareFn = (a, b) => a - b) {
        this.root = root;
        this.compareFn = compareFn;
    }

    /** insert(val): insert a new node into the BST with value val.
     * Returns the tree. Uses iteration. */
    insert(val) {
        const newNode = new Node(val);
        if (!this.root) {
            this.root = newNode;
            return this;
        }

        let node = this.root;
        while (true) {
            const cmpResult = this.compareFn(val, node.val);

            if (cmpResult < 0 && node.left) {
                node = node.left;
            } else if (cmpResult < 0) {
                node.left = newNode;
                break;
            } else if (node.right) {
                node = node.right;
            } else {
                node.right = newNode;
                break;
            }
        }

        newNode.parent = node;
        return this;
    }

    /** insertRecursively(val): insert a new node into the BST with value val.
     * Returns the tree. Uses recursion. */
    insertRecursively(val) {
        const newNode = new Node(val);
        if (!this.root) {
            this.root = newNode;
            return this;
        }

        const compareFn = this.compareFn;
        const f = function(node) {
            const cmpResult = compareFn(val, node.val);

            if (cmpResult < 0 && node.left) {
                f(node.left);
            } else if (cmpResult < 0) {
                node.left = newNode;
                newNode.parent = node;
            } else if (node.right) {
                f(node.right);
            } else {
                node.right = newNode;
                newNode.parent = node;
            }
        };

        f(this.root);
        return this;
    }

    /** find(val): search the tree for a node with value val.
     * return the node, if found; else undefined. Uses iteration. */
    find(val) {
        let node = this.root;
        while (node) {
            const cmpResult = this.compareFn(val, node.val);

            if (!cmpResult)
                return node;
            else if (cmpResult > 0)
                node = node.right;
            else
                node = node.left;
        }
    }

    /** findRecursively(val): search the tree for a node with value val.
     * return the node, if found; else undefined. Uses recursion. */
    findRecursively(val) {
        const compareFn = this.compareFn;
        const f = function(node) {
            if (node) {
                const cmpResult = compareFn(val, node.val);

                if (!cmpResult)
                    return node;
                else if (cmpResult > 0)
                    return f(node.right);
                else
                    return f(node.left);
            }
        };
        return f(this.root);
    }

    /** dfsPreOrder(): Traverse the array using pre-order DFS.
     * Return an array of visited nodes. */
    dfsPreOrder() {
        const visited = [];
        const f = function(node) {
            if (!node)
                return;

            visited.push(node.val);
            f(node.left);
            f(node.right);
        };
        f(this.root);

        return visited;
    }

    /** dfsInOrder(): Traverse the array using in-order DFS.
     * Return an array of visited nodes. */
    dfsInOrder() {
        const visited = [];
        const f = function(node) {
            if (!node)
                return;

            f(node.left);
            visited.push(node.val);
            f(node.right);
        };
        f(this.root);

        return visited;
    }

    /** dfsPostOrder(): Traverse the array using post-order DFS.
     * Return an array of visited nodes. */
    dfsPostOrder() {
        const visited = [];
        const f = function(node) {
            if (!node)
                return;

            f(node.left);
            f(node.right);
            visited.push(node.val);
        };
        f(this.root);

        return visited;
    }

    /** bfs(): Traverse the array using BFS.
     * Return an array of visited nodes. */
    bfs() {
        if (!this.root)
            return [];
        
        const nodes = [ this.root ], visited = [];
        const discovered = new Set([ this.root ]);
        while (nodes.length) {
            const node = nodes.shift();
            visited.push(node.val);

            if (node.left && !discovered.has(node.left)) {
                discovered.add(node.left);
                nodes.push(node.left);
            }
            if (node.right && !discovered.has(node.right)) {
                discovered.add(node.right);
                nodes.push(node.right);
            }
        }

        return visited;
    }
}

module.exports = BinarySearchTree;
