const { mean, median, mode, all, server } = require('./index');

beforeAll(() => server.close());

describe("Internal statistical operation functions work correctly.", () => {
    const datasets = [
        { data: [ 1, 4, 2, 6, 8, 5, 1, 0, 11, 5, 23 ], mean: 6, mode: 1, median: 5 }
    ];

    test("all functions require at least one parameter", () => {
        expect(() => mean([])).toThrow("nums are required.");
        expect(() => median([])).toThrow("nums are required.");
        expect(() => mode([])).toThrow("nums are required.");
        expect(() => all([])).toThrow("nums are required.");
    });

    test("mean works correctly", () => datasets.forEach(({ data, mean: expected }) =>
        expect(mean(data)).toEqual(expected)
    ));

    test("median works correctly", () => datasets.forEach(({ data, median: expected }) =>
        expect(median(data)).toEqual(expected)
    ));

    test("mode works correctly", () => datasets.forEach(({ data, mode: expected }) =>
        expect(mode(data)).toEqual(expected)
    ));

    test("all does all three operations", () => datasets.forEach(
        ({ data, mode: expectedMode, median: expectedMedian, mean: expectedMean }) => {
            const { mean, median, mode } = all(data);
            expect(mean).toEqual(expectedMean);
            expect(median).toEqual(expectedMedian);
            expect(mode).toEqual(expectedMode);
        }
    ));
});
