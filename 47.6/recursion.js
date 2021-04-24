/**
 * Finds the product of an array of numbers.
 * 
 * @param {number[]} nums List of numbers.
 * 
 * @returns {number}
 */
function product(nums) {
    const f = function (nums, accumulator = 1) {
        if (!nums.length)
            return accumulator;
        else
            return f(nums.slice(1), accumulator * nums[0]);
    };
    return f(nums, nums.length ? 1 : 0);
}

/**
 * Retrieves the length of the longest word in an array of words.
 * 
 * @param {string[]} words List of strings.
 * 
 * @returns {number}
 */
function longest(words) {
    const f = function (words, biggestLength = 0) {
        if (!words.length)
            return biggestLength;
        else
            return f(words.slice(1), Math.max(biggestLength, words[0].length));
    };
    return f(words);
}

/**
 * Constructs a string made up of every other character in a given string.
 * 
 * @param {string} str A string.
 * 
 * @returns {string}
 */
function everyOther(str) {
    const f = function (str, accumulator = "") {
        if (!str.length)
            return accumulator;
        else
            return f(str.slice(2), accumulator + str[0]);
    };
    return f(str);
}

/**
 * Checks whether a string is a palindrome or not.
 * 
 * @param {string} str A string.
 * 
 * @returns {boolean}
 */
function isPalindrome(str) {
    if (str.length <= 1)
        return true;
    else
        return (str[0] === str[str.length - 1]) && isPalindrome(str.slice(1, str.length - 1));
}

/**
 * Locates the index of a value in a given array.
 * 
 * @template T Type of item stored in the given array.
 * 
 * @param {T[]} arr List of items.
 * @param {T}   val Item to search for.
 * 
 * @returns {number} -1 if val isn't in the given array; valid index otherwise.
 */
function findIndex(arr, val) {
    const f = function (arr, val, accumulator = 0) {
        if (!arr.length)
            return -1;
        else
            return (arr[0] === val) ? accumulator : f(arr.slice(1), val, accumulator + 1);
    };
    return f(arr, val);
}

/** revString: return a copy of a string, but in reverse. */

function revString(str) {
    const f = function (str, accumulator = "") {
        if (str.length <= 1)
            return str + accumulator;
        else
            return f(str.slice(1), str[0] + accumulator);
    };
    return f(str);
}

/**
 * Retrieves string values contained within an object, including nested objects.
 * 
 * @param {any} obj Some object.
 * 
 * @returns {string[]} List of string values.
 */
function gatherStrings(obj) {
    let accumulator = [];
    
    for (const item of Object.getOwnPropertyNames(obj)) {
        const type = typeof obj[item];
        if (type === 'string')
            accumulator.push(obj[item]);
        else if (type === 'object')
            accumulator = [ ...accumulator, ...gatherStrings(obj[item]) ];
    }

    return accumulator;
}

/** binarySearch: given a sorted array of numbers, and a value,
 * return the index of that value (or -1 if val is not present). */

/**
 * Returns the index of an item given a list of sorted items.
 * 
 * @template T Type of item stored in the given array.
 * 
 * @param {T[]}                           arr       List of items.
 * @param {T}                             val       Item to search for.
 * @param {(left: T, right: T) => number} compareFn Comparison function arr was sorted with.
 * 
 * @returns {number} -1 if val isn't in the given array; valid index otherwise.
 */
function binarySearch(arr, val, compareFn = ((a, b) => a - b)) {
    const f = function (low, high) {
        if (high < low) {
            return -1;
        } else {
            const mid = low + Math.floor((high - low) / 2);
            
            const result = compareFn(val, arr[mid]);
            if (result === 0)
                return mid;
            else if (result < 0)
                return f(low, mid - 1);
            else if (result > 0)
                return f(mid + 1, high);
            else
                return -1;
        }
    }
    return f(0, arr.length - 1);
}

module.exports = {
    product,
    longest,
    everyOther,
    isPalindrome,
    findIndex,
    revString,
    gatherStrings,
    binarySearch
};
