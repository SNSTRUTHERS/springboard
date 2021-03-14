module.exports = [
    { prefix: "/companies",  router: require("./companies") },
    { prefix: "/invoices",   router: require("./invoices") },
    { prefix: "/industries", router: require("./industries") }
];
