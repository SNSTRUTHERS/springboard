/**
 * A node containing a value in a linked list.
 * 
 * @template T Type of item being contained in this node.
 */
class Node {
    /** @type {T} */
    val;

    /** @type {Node<T>?} */
    next;

    /**
     * Creates a new linked list node.
     * 
     * @param {T} val New value to use in this node.
     */
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

/**
 * The least cache-efficient data structure :^)
 * 
 * @template T Type of item being used in the list.
 */
class LinkedList {
    /**
     * Length of the list.
     * 
     * @readonly
     * @type {number}
     */
    length;

    /**
     * Creates a new linked list.
     * 
     * @param {T[]} vals Values to initialize the list with.
     */
    constructor(vals = []) {
        /**
         * The start of the list.
         * @type {Node<T>}
         */
        this.head = null;
        
        /**
         * The end of the list.
         * @type {Node<T>}
         */
        this.tail = null;

        this.length = 0;

        for (let val of vals)
            this.push(val);
    }

    /**
     * Pushes a new value to the end of the list.
     * 
     * @param {T} val Item to be pushed.
     */
    push(val) {
        if (!this.head) {
            this.head = new Node(val);
            this.tail = this.head;
        } else {
            this.tail.next = new Node(val);
            this.tail = this.tail.next;
        }

        this.length++;
    }

    /**
     * Pushes a new value to the beginning of the list.
     * 
     * @param {T} val Item to be pushed.
     */
    unshift(val) {
        if (!this.head) {
            this.push(val);
        } else {
            const newNode = new Node(val);
            newNode.next = this.head;
            this.head = newNode;
            this.length++;
        }
    }

    /**
     * Returns & removes the last item of the list.
     * 
     * @returns The last item in the list.
     */
    pop() {
        if (!this.length)
            throw new Error("List is empty.");
        
        const value = this.tail.val;
        
        if (this.head === this.tail) {
            this.head = null;
            this.tail = null;
            this.length--;
            return value;
        }

        let newTail = this.head;
        while (newTail.next !== this.tail)
            newTail = newTail.next;

        this.tail = newTail;
        this.tail.next = null;
        this.length--;
        return value;
    }

    /**
     * Returns & removes the first item of the list.
     * 
     * @returns The first item in the list.
     */
    shift() {
        if (!this.length)
            throw new Error("List is empty.");

        const value = this.head.val;
        this.head = this.head.next;
        this.length--;

        if (!this.head)
            this.tail = null;
        
        return value;
    }

    /**
     * Retrieves the value of an item in the list at a given index.
     * 
     * @param {number} idx Index to access.
     * 
     * @returns Item at given index in the list.
     */
    getAt(idx) {
        if (idx < 0 || idx > this.length - 1)
            throw new Error("Invalid index.");

        let node = this.head;
        for (let i = 0; i < idx; i++)
            node = node.next;

        return node.val;
    }

    /**
     * Sets the value of an item in the list at a given index.
     * 
     * @param {number} idx Index to access.
     * @param {T}      val New value to assign.
     */
    setAt(idx, val) {
        if (idx < 0 || idx > this.length - 1)
            throw new Error("Invalid index.");

        let node = this.head;
        for (let i = 0; i < idx; i++)
            node = node.next;

        node.val = val;
    }

    /**
     * Inserts a new item into the list at a given index.
     * 
     * @param {number} idx Index to assign.
     * @param {T}      val New value to insert.
     */
    insertAt(idx, val) {
        if (idx < 0 || idx > this.length)
            throw new Error("Invalid index.");

        const newNode = new Node(val);
        if (idx === 0) {
            newNode.next = this.head;
            this.head = newNode;

            if (!this.tail)
                this.tail = this.head;
        } else if (idx === this.length) {
            this.tail.next = newNode;
            this.tail = newNode;
        } else {
            let node = this.head;
            for (let i = 0; i < idx - 1; i++)
                node = node.next;

            newNode.next = node.next;
            node.next = newNode;
        }

        this.length++;
    }

    /**
     * Removes an existing item from the list at a given index.
     * 
     * @param {number} idx Index to remove.
     */
    removeAt(idx) {
        if (idx < 0 || idx > this.length - 1)
            throw new Error("Invalid index.");

        if (idx === 0) {
            const rmNode = this.head;
            this.head = rmNode.next;
            rmNode.next = null;

            if (!rmNode.next)
                this.tail = null;
        } else {
            let node = this.head;
            for (let i = 0; i < idx - 1; i++)
                node = node.next;

            const rmNode = node.next;
            node.next = node.next.next;
            rmNode.next = null;

            if (rmNode === this.tail)
                this.tail = node;
        }

        this.length--;
    }

    /**
     * @template U Value being reduced.
     * 
     * @param {(previousValue: U, currentValue: T, currentIndex: number) => U} reducer
     * @param {U} initial The initial value.
     */
    reduce(reducer, initial) {
        let value = initial, idx = 0;
        for (let node = this.head; node; node = node.next)
            value = reducer(value, node.val, idx++);
        
        return value;
    }

    /**
     * Averages the values of a linked list together.
     * 
     * @returns Average value of all items in the linked list.
     */
    average() {
        if (this.length)
            return this.reduce((accumulator, value) => accumulator + value, 0) / this.length;
        else
            return 0;
    }
}

module.exports = LinkedList;
