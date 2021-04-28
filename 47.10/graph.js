/**
 * @template T Type of value being stored in this node.
 */
class Node {
    /**
     * Creates a new graph node.
     * 
     * @param {T} value Value being stored in this node.
     * @param {Set<Node<T>>} adjacent Adjacent nodes.
     */
    constructor(value, adjacent = new Set()) {
        this.value = value;
        this.adjacent = adjacent;
    }
}

/**
 * @template T Type of value being stored in this graph.
 */
class Graph {
    constructor() {
        /** @type {Set<Node<T>>} */
        this.nodes = new Set();
    }

    // this function accepts a Node instance and adds it to the nodes property
    // on the graph
    addVertex(vertex) {
        this.nodes.add(vertex);
    }

    // this function accepts an array of Node instances and adds them to the
    // nodes property on the graph
    addVertices(vertexArray) {
        for (const vertex of vertexArray)
            this.addVertex(vertex);
    }

    // this function accepts two vertices and updates their adjacent values to
    // include the other vertex
    addEdge(v1, v2) {
        v1.adjacent.add(v2);
        v2.adjacent.add(v1);
    }

    // this function accepts two vertices and updates their adjacent values to
    // remove the other vertex
    removeEdge(v1, v2) {
        v1.adjacent.delete(v2);
        v2.adjacent.delete(v1);
    }

    // this function accepts a vertex and removes it from the nodes property,
    // it also updates any adjacency lists that include that vertex
    removeVertex(vertex) {
        for (const node of vertex.adjacent.values())
            node.adjacent.delete(vertex);
        this.nodes.delete(vertex);
    }

    // this function returns an array of Node values using DFS
    depthFirstSearch(start) {
        const visited = [];
        const discovered = new Set();
        
        const f = function(node) {
            if (!node || discovered.has(node))
                return;

            visited.push(node.value);
            discovered.add(node);

            for (const neighbor of node.adjacent)
                f(neighbor);
        };

        f(start);
        return visited;
    }

    // this function returns an array of Node values using BFS
    breadthFirstSearch(start) {
        const nodes = [ start ], visited = [];
        const discovered = new Set([ start ]);
        while (nodes.length) {
            const node = nodes.shift();
            visited.push(node.value);

            for (const neighbor of node.adjacent) {
                if (!discovered.has(neighbor)) {
                    discovered.add(neighbor);
                    nodes.push(neighbor);
                }
            }
        }

        return visited;
    }
}

module.exports = {Graph, Node};
