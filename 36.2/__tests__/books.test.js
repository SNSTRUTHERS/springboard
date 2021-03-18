process.env.NODE_ENV = 'test';

const request = require("supertest");

const app = require("../app");
const db = require("../db");

// == SET UP/SHUT DOWN TESTS ==================================================================== //

// sample book ISBN
let bookISBN;

beforeEach(async () => {
    const { rows: [ { isbn } ] } = await db.query(`
        INSERT INTO books (
            isbn, amazon_url, author, language, pages, publisher, title, year
        ) VALUES (
            '0691161518',
            'http://a.co/eobPtX2',
            'Matthew Lane',
            'english',
            264,
            'Princeton University Press',
            'Power-Up: Unlocking the Hidden Mathematics in Video Games',
            2017
        ) RETURNING isbn
    `);
    bookISBN = isbn;
});

afterEach(async () => {
    await db.query("DELETE FROM books");
});

afterAll(async() => await db.end());

// == TEST CASES ================================================================================ //

describe("GET /books", () => {
    test("Retrieves list of all books in database.", async () => {
        const response = await request(app).get('/books');
        const { books } = response.body;

        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty('amazon_url');
        expect(books[0]).toHaveProperty('isbn');
    });
});

describe("GET /books/:isbn", () => {
    test("Retrieves a specific book.", async () => {
        const response = await request(app).get(`/books/${bookISBN}`);
        const { book } = response.body;

        expect(book).toHaveProperty('isbn');
        expect(book.isbn).toBe(bookISBN);
    });

    test("Doesn't retrieve a book that doesn't exist.", async () => {
        const response = await request(app).get('/books/65536');

        expect(response.status).toBe(404);
    });
});

describe("POST /books", () => {
    test("Creates a new book.", async () => {
        let response = await request(app).post('/books').send({
            isbn: '0198526636',
            amazon_url: 'https://www.amazon.com/dp/0198526636/131-1921725-9856944',
            author: 'John Haigh',
            title: 'Taking Chances: Winning with Probability',
            language: 'english',
            publisher: 'Oxfor University Press',
            year: 2005,
            pages: 138
        });

        expect(response.status).toBe(201);
        expect(response.body.book).toHaveProperty('isbn');

        response = await request(app).get(`/books/${response.body.book.isbn}`);
        expect(response.status).toBe(200);
    });

    test("Doesn't create a new book without required parameters.", async () => {
        const response = await request(app).post('/books').send({ year: 2018 });
        expect(response.status).toBe(400);
    });
});

describe("PUT /books/:isbn", () => {
    test("Updates an existing book.", async () => {
        const response = await request(app).put(`/books/${bookISBN}`).send({
            amazon_url: 'https://test.com',
            author: 'i',
            title: 'lowercase title lol',
            pages: 2500
        });
        const { book } = response.body;

        expect(book.isbn).toEqual(bookISBN);
        expect(book.title).toEqual('lowercase title lol');
    });

    test("Doesn't update a book with invalid parameters.", async () => {
        const response = await request(app).put(`/books/${bookISBN}`).send({
            amazon_url: 'https://test.com',
            author: 'i',
            title: 'lowercase title lol',
            pages: 2500,
            year: (new Date()).getUTCFullYear() + 15
        });

        expect(response.status).toBe(400);
    });

    test("Doesn't update a book that doesn't exist.", async () => {
        const response = await request(app).put('/books/65536');

        expect(response.status).toBe(404);
    });
});

describe("DELETE /books/:isbn", () => {
    test("Deletes an existing book.", async () => {
        let response = await request(app).delete(`/books/${bookISBN}`);
        expect(response.status).toBe(200);

        response = await request(app).get(`/books/${bookISBN}`);
        expect(response.status).toBe(404);
    });

    test("Doesn't delete a book that doesn't exist.", async () => {
        const response = await request(app).delete('/books/65536');

        expect(response.status).toBe(404);
    });
});
