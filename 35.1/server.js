/** Server startup for BizTime. */

const { argv } = require("process");
const app = require("./app");

app.listen(Number(argv[2]) || 3000);
