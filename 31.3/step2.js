const axios = require("axios");
const { readFile } = require("fs");
const process = require("process");

const cat = (filename) => readFile(filename, "utf8", (error, data) => {
    if (error) {
        console.error(`Error reading ${filename}\n  ${error}`);
        process.exit(1);
    } else {
        console.log(data);
    }
});

const webCat = async (url) => {
    try {
        const { data } = await axios.get(url);
        console.log(data);
    } catch (error) {
        console.error(`Error fetching ${url}:\n  ${error}`);
        process.exit(1);
    }
}

process.argv.slice(2).forEach((arg) => arg.startsWith("http") ? webCat(arg) : cat(arg));
