/**
 * Data structure where items can be added to the back or removed from the front.
 * 
 * @template T Type of items being contained in the queue.
 */
class Queue {
    /**
     * Creates a new queue.
     */
    constructor() {
        /** @type {T[]} */
        this._arr = [];
    }

    /**
     * The size of the queue.
     */
    get size() {
        return this._arr.length;
    }

    get first() {
        return this.isEmpty() ? null : { val: this._arr[0] };
    }

    get last() {
        return this.isEmpty() ? null : { val: this._arr[this.size - 1] };
    }

    /**
     * Adds a new item to the end of the queue.
     * 
     * @param {T} val Item to insert.
     */
    enqueue(val) {
        this._arr.push(val);
    }

    /**
     * Removes the item at the start of the queue.
     * 
     * @returns Value of the item formerly at the start of the queue.
     */
    dequeue() {
        if (this.isEmpty())
            throw new Error("Queue is empty.");

        return this._arr.shift();
    }

    /**
     * Retrieves the value of the item at the start of the queue.
     * 
     * @returns Value of the item at the start of the queue.
     */
    peek() {
        return this._arr[0];
    }

    /**
     * Retrieves whether the queue is empty or not.
     * 
     * @returns True of the queue is empty; false otherwise.
     */
    isEmpty() {
        return !this.size;
    }
}

module.exports = Queue;
