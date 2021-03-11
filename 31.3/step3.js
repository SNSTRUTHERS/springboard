const axios = require("axios");
const { readFile, writeFile } = require("fs");
const process = require("process");

const writeOut = (text, out) => {
    if (out === console) {
        out.log(text);
    } else {
        writeFile(out, text, 'utf8', (error) => {
            console.error(`Couldn't write to ${out}:\n  ${error}`);
            process.exit(1);
        });
    }
};

const cat = (filename, out = console) => readFile(filename, "utf8", (error, data) => {
    if (error) {
        console.error(`Error reading ${filename}\n  ${error}`);
        process.exit(1);
    } else {
        writeOut(data, out);
    }
});

const webCat = async (url, out = console) => {
    try {
        const { data } = await axios.get(url);
        writeOut(data, out);
    } catch (error) {
        console.error(`Error fetching ${url}:\n  ${error}`);
        process.exit(1);
    }
}

const out = (process.argv[2] === "--out") ? process.argv[3] : console;
const start = 2 + (2 * !!(out !== console));
if (out === undefined) {
    console.error("Command line option `--out' missing required argument.");
    process.exit(1);
}

process.argv.slice(start).forEach((arg) => (arg.startsWith("http") ? webCat : cat)(arg, out));
