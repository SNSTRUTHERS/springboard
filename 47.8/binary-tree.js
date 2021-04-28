/** BinaryTreeNode: node for a general tree. */

/**
 * Node in a binary tree.
 * 
 * @template T Type of item being contained in this node.
 */
class BinaryTreeNode {
    /**
     * Creates a new node.
     * 
     * @param {T} val Value being stored in this node.
     * @param {BinaryTreeNode<T>} left  Left-hand node.
     * @param {BinaryTreeNode<T>} right Right-hand node.
     */
    constructor(val, left = null, right = null) {
        this.parent = null;
        this.val = val;

        this.left = left;
        if (left)
            this.left.parent = this;
        
        this.right = right;
        if (right)
            this.right.parent = this;
    }
}

/**
 * @template T Type of item being contained in this tree.
 */
class BinaryTree {
    /**
     * Creates a new binary tree.
     * 
     * @param {BinaryTreeNode<T>?} root 
     */
    constructor(root = null) {
        this.root = root;
    }

    /** minDepth(): return the minimum depth of the tree -- that is,
     * the length of the shortest path from the root to a leaf. */
    minDepth() {
        const f = function(node) {
            if (!node)
                return 0;
            else
                return 1 + Math.min(f(node.left), f(node.right));
        };
        return f(this.root);
    }

    /** maxDepth(): return the maximum depth of the tree -- that is,
     * the length of the longest path from the root to a leaf. */
    maxDepth() {
        const f = function(node) {
            if (!node)
                return 0;
            else
                return 1 + Math.max(f(node.left), f(node.right));
        };
        return f(this.root);
    }

    /** maxSum(): return the maximum sum you can obtain by traveling along a path in the tree.
     * The path doesn't need to start at the root, but you can't visit a node more than once. */
    maxSum() {
        let sum = 0;
        const f = function(node) {
            if (!node) {
                return 0;
            } else {
                const left = f(node.left), right = f(node.right);
                sum = Math.max(sum, node.val + left + right);
                return Math.max(0, left + node.val, right + node.val);
            }
        };
        f(this.root);
        return sum;
    }

    /** nextLarger(lowerBound): return the smallest value in the tree
     * which is larger than lowerBound. Return null if no such value exists. */
    nextLarger(lowerBound) {
        if (!this.root)
            return null;

        const queue = [ this.root ];
        let closest = null;
        while (queue.length) {
            const node = queue.shift();
            const val = node.val;

            if (val > lowerBound && (closest === null || val < closest))
                closest = val;

            if (node.left)
                queue.push(node.left);
            if (node.right)
                queue.push(node.right);
        }

        return closest;
    }

    /** areCousins(node1, node2): determine whether two nodes are cousins
     * (i.e. are at the same level but have different parents. ) */
    areCousins(node1, node2) {
        if (node1 === this.root || node2 === this.root)
            return false;

        const f = function(node1, node2, accumulator = 0) {
            if (!node1 || !node2)
                return -1;
            else if (node1 === node2)
                return accumulator;
            else
                return f(node1.parent, node2.parent, accumulator + 1);
        };
        return f(node1, node2) > 1;
    }

    /** lowestCommonAncestor(node1, node2): find the lowest common ancestor
     * of two nodes in a binary tree. */
    lowestCommonAncestor(node1, node2) {
        const f = function(node1, node2, current) {
            if (!current) {
                return null;
            } else if (current === node1 || current === node2) {
                return current;
            } else {
                const left = f(node1, node2, current.left);
                const right = f(node1, node2, current.right);

                if (left !== null && right !== null)
                    return current;
                else if (left !== null || right !== null)
                    return left || right;
                else
                    return null;
            }
        }
        return f(node1, node2, this.root);
    }
}

module.exports = { BinaryTree, BinaryTreeNode };
