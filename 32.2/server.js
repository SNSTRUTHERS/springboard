const { app, setErrorCallback } = require("./app");
const { argv } = require("process");

setErrorCallback((error) => console.error(error));
app.listen(Number(argv[2]) || 5150);
