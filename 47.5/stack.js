/**
 * Data structure where items can be added or removed from the front.
 * 
 * @template T Type of items being contained in the stack.
 */
class Stack {
    /**
     * Creates a new stack.
     */
    constructor() {
        /** @type {T[]} */
        this._arr = [];
    }

    /**
     * The size of the stack.
     */
    get size() {
        return this._arr.length;
    }

    get first() {
        return this.isEmpty() ? null : { val: this._arr[this.size - 1] };
    }

    get last() {
        return this.isEmpty() ? null : { val: this._arr[0] };
    }

    /**
     * Pushes a new item to the front of the stack.
     * 
     * @param {T} val Item to insert.
     */
    push(val) {
        this._arr.push(val);
    }

    /**
     * Removes the item at the front of the stack.
     * 
     * @returns Value of the item formerly at the front of the stack.
     */
    pop() {
        if (this.isEmpty())
            throw new Error("Stack is empty.");

        return this._arr.pop();
    }

    /**
     * Retrieves the value of the item at the front of the stack.
     * 
     * @returns Value of the item at the front of the stack.
     */
    peek() {
        return this._arr[this.size - 1];
    }

    /**
     * Retrieves whether the stack is empty or not.
     * 
     * @returns True of the stack is empty; false otherwise.
     */
    isEmpty() {
        return !this.size;
    }
}

module.exports = Stack;
