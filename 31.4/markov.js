/** Textual markov chain generator */


/**
 * Returns a randomly selected element from an array.
 * 
 * @param {any[]} arr An arbitrary array.
 * @returns A random element from the array.
 */
 function choice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * An object-oriented Markov machine.
 */
class MarkovMachine {
    /**
     * Builds a Markov machine by reading in sample text.
     * 
     * @param {String} text       A sample sentence from which to generate Markov chains from.
     * @param {Number} multigrams How many words to use as Markov chain keys (e.g. 1 = single words;
     *                            2 = bigrams). Defaults to 2.
     */
    constructor(text, multigrams = 2) {
        let words = text.split(/[ \r\n]+/);
        this.words = words.filter(c => c !== "");
        this.chains = undefined;
        this.makeChains(multigrams);
    }

    /**
     * Initializes this machine's list of Markov chains.
     * 
     * @param {Number} multigrams How many words to use as Markov chain keys (e.g. 1 = single words;
     *                            2 = bigrams).
     */
    makeChains(multigrams) {
        this.multigrams = multigrams;

        /** @type {Map<String, String[]>} */
        const chains = new Map();

        for (let i = 0; i < this.words.length - (multigrams - 1); i++) {
            const multigram = this.words.slice(i, i + multigrams).join(' ');
            const nextWord = this.words[i + multigrams] || null;

            if (chains.has(multigram))
                chains.get(multigram).push(nextWord);
            else
                chains.set(multigram, [nextWord]);
        }

        this.chains = chains;
    }

    *[Symbol.iterator]() {
        /** @type {String} */
        let key = choice(Array.from(this.chains.keys()).filter((value) => 
            value[0] === value.toUpperCase()[0] &&
            ['_', '*'].indexOf(value[0]) == -1
        ));
        const words = key.split(' ');

        while (true) {
            const word = words.shift();
            yield word;

            const choices = this.chains.get(key);
            if ('.?!'.includes(word.charAt(word.length - 1))) {
                break;
            } else if (choices[0] === null) {
                while (words.length > 0)
                    yield words.shift();
                break;
            } else {
                const newWord = choice(choices);
                words.push(newWord);
                key = words.join(' ');
            }
        }
    }

    /**
     * Generates a new sentence.
     * 
     * @param {Number} numWords The maximum number of words to have in the generated sentence.
     * @returns A randomly generated sentence.
     */
    makeText(numWords = 100) {
        let i = 0;
        const words = [];
        for (const word of this) {
            words.push(word);
            if (++i >= numWords)
                break;
        }

        return words.join(' ');
    }
}

module.exports = {
    MarkovMachine
};
