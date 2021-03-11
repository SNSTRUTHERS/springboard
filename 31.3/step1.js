const { readFile } = require("fs");
const process = require("process");

const cat = (filename) => readFile(filename, "utf8", (error, data) => {
    if (error) {
        console.error(error);
        process.exit(1);
    } else {
        console.log(data);
    }
});

process.argv.slice(2).forEach((arg) => cat(arg));
