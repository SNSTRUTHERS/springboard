/**
 * Node in a tree structure.
 * 
 * @template T Type of item being contained in this node.
 */
class TreeNode {
    /**
     * Creates a new tree node.
     * 
     * @param {T} val 
     * @param {TreeNode<T>[]} children 
     */
    constructor(val, children = []) {
        this.val = val;
        this.children = children;
    }
}

/**
 * @template T Type of item being contained in this tree.
 */
class Tree {
    /**
     * Creates a new tree.
     * 
     * @param {TreeNode<T>?} root 
     */
    constructor(root = null) {
        this.root = root;
    }

    /** sumValues(): add up all of the values in the tree. */
    sumValues() {
        let accumulator = 0;
        const f = function(node) {
            if (node) {
                accumulator += node.val;
                for (const child of node.children)
                    f(child);
            }
        };
        f(this.root);
        return accumulator;
    }

    /** countEvens(): count all of the nodes in the tree with even values. */
    countEvens() {
        let accumulator = 0;
        const f = function(node) {
            if (node) {
                accumulator += (node.val + 1) % 2;
                for (const child of node.children)
                    f(child);
            }
        };
        f(this.root);
        return accumulator;
    }

    /** numGreater(lowerBound): return a count of the number of nodes
     * whose value is greater than lowerBound. */
    numGreater(lowerBound) {
        let accumulator = 0;
        const f = function(node) {
            if (node) {
                accumulator += Number(node.val > lowerBound);
                for (const child of node.children)
                    f(child);
            }
        };
        f(this.root);
        return accumulator;
    }
}

module.exports = { Tree, TreeNode };
