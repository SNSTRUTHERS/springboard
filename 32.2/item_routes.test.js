process.env.NODE_ENV = "test";

const request = require("supertest");
const { app } = require("./app");
const fakeDB = require("./fakedb");

const DB_TEST_ITEMS = [
    { name: "pickes", price: 2.49 },
    { name: "mayo", price: 1.99 },
    { name: "shirt", price: 28.50 }
];

beforeEach(() => {
    DB_TEST_ITEMS.forEach(({name, price}) => fakeDB.set(name, price));
});

afterEach(() => {
    fakeDB.clear();
});

describe("GET /items", () => {
    test("Retrieve all items", async () => {
        const res = await request(app).get("/items");
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(DB_TEST_ITEMS);
    });
});

describe("POST /items", () => {
    test("Should validate input", async () => {
        const requests = [
            request(app).post("/items").send([]),
            request(app).post("/items").send({}),
            request(app).post("/items").send({ name: 15, price: 11.5 }),
            request(app).post("/items").send({ name: "hello", price: [] })
        ];
        const responses = await Promise.all(requests);

        expect(responses.every((res) => res.status === 400)).toBe(true);
        expect(responses.every((res) => res.body.code === 400)).toBe(true);

        expect(responses[1].body.errors).toContain('Missing parameter "name".');
        expect(responses[1].body.errors).toContain('Missing parameter "price".');
        
        expect(responses[2].body.errors).toContain('"name" must be a string.');
        
        expect(responses[3].body.errors).toContain('"price" must be a number.');
    });

    test("Should not allow duplicate names", async () => {
        const requests = DB_TEST_ITEMS.map(({ name }) =>
            request(app).post("/items").send({ name, price: 88 })
        );
        const responses = await Promise.all(requests);

        expect(responses.every((res) => res.status === 400)).toBe(true);
        expect(responses.every((res) => res.body.code === 400)).toBe(true);

        for (let i = 0; i < responses.length; i++) {
            const { name, price } = DB_TEST_ITEMS[i];

            expect(responses[i].body.errors).toContain(`Name "${name}" already used.`);
            expect(fakeDB.get(name)).toEqual(price);
        }
    });

    test("Creating a new item", async () => {
        const newItem = { name: "oreos", price: 4.99 };
        const res = await request(app).post("/items").send(newItem);

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ added: newItem });
        expect(fakeDB.has("oreos")).toBe(true);
    });
});

describe("GET /items/:item", () => {
    test("Doesn't retrieve an item that doesn't exist", async () => {
        const res = await request(app).get("/items/abcdefg");
        expect(res.status).toBe(404);
        expect(res.body.errors).toContain('"abcdefg" not in items.');
    });

    test("Retrieving an existing item", async () => {
        const requests = DB_TEST_ITEMS.map(({ name }) =>
            request(app).get(`/items/${name}`)
        );
        const responses = await Promise.all(requests);
        
        for (let i = 0; i < responses.length; i++) {
            expect(responses[i].status).toBe(200);
            expect(responses[i].body).toEqual(DB_TEST_ITEMS[i]);
        }
    });
});

describe("PATCH /items/:item", () => {
    const TO_UPDATE = `/items/${DB_TEST_ITEMS[0].name}`;

    test("Doesn't update an item that doesn't exist", async () => {
        const res = await request(app).patch("/items/abcdefg").send({ price: 15 });
        expect(res.status).toBe(404);
        expect(res.body.errors).toContain('"abcdefg" not in items.');
    });

    test("Should validate input", async () => {
        const requests = [
            request(app).patch(TO_UPDATE).send({ name: 15, price: 11.5 }),
            request(app).patch(TO_UPDATE).send({ name: "hello", price: [] })
        ];
        const responses = await Promise.all(requests);

        expect(responses.every((res) => res.status === 400)).toBe(true);
        
        expect(responses[0].body.errors).toContain('"name" must be a string.');
        expect(responses[1].body.errors).toContain('"price" must be a number.');
    });

    test("Updating an existing item", async () => {
        const requests = [
            request(app).patch(`/items/${DB_TEST_ITEMS[0].name}`).send({}),
            request(app).patch(`/items/${DB_TEST_ITEMS[1].name}`).send({ name: "oreos" }),
            request(app).patch(`/items/${DB_TEST_ITEMS[2].name}`).send({
                price: DB_TEST_ITEMS[2].price * 2
            })
        ];
        const responses = await Promise.all(requests);

        expect(responses.every((res) => res.status === 200)).toBe(true);

        expect(fakeDB.get(DB_TEST_ITEMS[0].name)).toEqual(DB_TEST_ITEMS[0].price);

        expect(fakeDB.get(DB_TEST_ITEMS[1].name)).toBeUndefined();
        expect(fakeDB.get("oreos")).toEqual(DB_TEST_ITEMS[1].price);

        expect(fakeDB.get(DB_TEST_ITEMS[2].name)).toEqual(DB_TEST_ITEMS[2].price * 2);

        const res = await request(app).patch("/items/oreos").send({
            name: DB_TEST_ITEMS[1].name,
            price: DB_TEST_ITEMS[1].price * 2
        });
        expect(res.status).toBe(200);
        expect(fakeDB.get("oreos")).toBeUndefined();
        expect(fakeDB.get(DB_TEST_ITEMS[1].name)).toEqual(DB_TEST_ITEMS[1].price * 2);
    });
});

describe("DELETE /items/:item", () => {
    test("Doesn't delete an item that doesn't exist", async () => {
        const res = await request(app).delete("/items/abcdefg").send({ price: 15 });
        expect(res.status).toBe(404);
        expect(res.body.errors).toContain('"abcdefg" not in items.');
    });

    test("Deletes an existing item", async () => {
        const res = await request(app).delete(`/items/${DB_TEST_ITEMS[0].name}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: "Deleted." });
        expect(fakeDB.get(DB_TEST_ITEMS[0].name)).toBeUndefined();
    });
});