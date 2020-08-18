// ES2015 version of filterOutOdds from es5.js
const filterOutOdds = (...nums) => nums.filter((num) => num % 2 === 0);

// findMin
const findMin = (...nums) => nums.reduce((min, num) => num < min ? num : min, Infinity);

// mergeObjects
const mergeObjects = (obj1, obj2) => ({...obj1, ...obj2});

// doubleAndReturnArgs
const doubleAndReturnArgs = (num_arr, ...nums) => nums.reduce((new_arr, num) => {
    new_arr.push(num * 2);
    return new_arr;
}, num_arr);
