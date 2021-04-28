const getDigit = (number, digit) =>
    Math.floor(Math.abs(number) / Math.pow(10, digit)) % 10;
;

const digitCount = (number) =>
    (!number) ? 1 : Math.floor(Math.log10(Math.abs(number))) + 1
;

const mostDigits = (numbers) => numbers.reduce((prev, current) =>
    Math.max(prev, digitCount(current))
, 0);

function radixSort(numbers) {
    const maxDigits = mostDigits(numbers);
    for (let i = 0; i < maxDigits; i++) {
        const buckets = [];
        for (let j = 0; j < 10; j++)
            buckets.push([]);

        for (let j = 0; j < numbers.length; j++) {
            const number = numbers[j], digit = getDigit(number, i);
            buckets[digit].push(number);
        }

        numbers = [].concat(...buckets);
    }

    return numbers;
}

module.exports = { getDigit, digitCount, mostDigits, radixSort };
