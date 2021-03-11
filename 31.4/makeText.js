/** Command-line tool to generate Markov text. */

const { get: wget } = require("axios");
const { readFile } = require("fs");
const { argv, exit } = require("process");

const { MarkovMachine } = require("./markov");

const execPath = argv.shift() + ' ' + argv.shift();

// prints usage and exits
function usage() {
    console.log(
`usage:
  ${execPath} [n=2] (path...)
    Generates a markov machine from the provided files, generates a random sentence,
    prints it to standard output, then exits.

    [n] is the number of words used to make up keys in the Markov chains the machine
    produces. Higher numbers combined with a larger amount of sample data will
    result in more realistic sentences being produced. Must be greater than 0.
  ${execPath} help
    Prints this help screen and exits.`
    );
    
    exit(0);
}

// == FETCH DATA FROM PATHS ===================================================================== //

class FetchError extends Error {
    constructor(prefix, error) {
        super(error);
        this.prefix = prefix;
        this.error = error;
    }
}

// retrieves data from the internet
async function readWeb(url) {
    try {
        const { data } = await wget(url);
        return data;
    } catch (error) {
        throw new FetchError(`Error fetching "${url}"`, error);
    }
}

// retrieves data from local filesys
function readLocal(path) {
    return new Promise((resolve, reject) => {
        readFile(path, 'utf8', (error, data) => {
            if (error)
                reject(new FetchError(`Error reading "${path}"`, error));
            else
                resolve(data);
        });
    });
}

// ============================================================================================== //

if (argv.length === 0 || argv[0] === 'help')
    usage();

let multigrams = 2;
if (!isNaN(Number(argv[0])))
    multigrams = argv.shift();

Promise.all(argv.map((path) =>
    (path.startsWith('http://') || path.startsWith('https://')) ? readWeb(path) : readLocal(path)
)).then((values) => {
    const markovMachine = new MarkovMachine(values.join(' '));
    console.log(markovMachine.makeText());
    exit(0);
}).catch((error) => {
    console.error(`${error.prefix}\n  ${error.error}`);
    exit(1);
});
