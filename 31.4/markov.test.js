const { MarkovMachine } = require("./markov");

describe("Markov Machine functionality & validity", () => {
    /** @type {MarkovMachine} */
    let mm;
    beforeAll(() => {
        mm = new MarkovMachine(
            "Hello world. I    am\na potato not. Lol this is cool is it not?\n" +
            '"Of course we can have multiple things at a time like this."\r' +
            "he said. WOW IT'S SO COOL! I like how this sort of stuff works."
        );
    });

    test("Should split words on whitespace characters.", () => {
        for (const word of mm.words) {
            expect(word.indexOf(' ')).toBe(-1);
            expect(word.indexOf('\n')).toBe(-1);
        }

        expect([
            'hello', 'world', 'i', 'am', 'a', 'potato.', 'lol', 'this', 'is', 'cool', 'it', 'not?'
        ].every((value) => mm.words.includes(value)));
        expect(mm.words).not.toContain('abc');
    });

    test("Should start sentences that start with capital letters or quotation marks.", () => {
        for (let i = 0; i < 10; i++) {
            const text = mm.makeText();
            expect('HLOWISC"').toContain(text[0]);
        }
    });

    test("Should end sentences with periods, question marks, or exclamation points.", () => {
        for (let i = 0; i < 10; i++) {
            const text = mm.makeText();
            expect('.!?').toContain(text[text.length - 1]);
        }
    });
});
